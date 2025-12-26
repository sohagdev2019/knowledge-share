"use server";

import { requireUser } from "@/app/data/user/require-user";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 5,
  })
);

export async function cancelSubscription(): Promise<ApiResponse> {
  const user = await requireUser();

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: user.id,
    });

    if (decision.isDenied()) {
      return {
        status: "error",
        message: "You have been blocked",
      };
    }

    // Get user's active subscription
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ["Active", "Trial"],
        },
      },
    });

    if (!subscription) {
      return {
        status: "error",
        message: "No active subscription found",
      };
    }

    // Cancel in Stripe if subscription exists
    if (subscription.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
      } catch (error) {
        console.error("Error canceling Stripe subscription:", error);
        // Continue with database update even if Stripe fails
      }
    }

    // Update subscription in database
    await prisma.userSubscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        autoRenew: false,
        cancelledAt: new Date(),
        status: "Cancelled",
      },
    });

    // Create history record
    await prisma.subscriptionHistory.create({
      data: {
        userId: user.id,
        subscriptionId: subscription.id,
        action: "Cancelled",
        oldPlanId: subscription.planId,
      },
    });

    return {
      status: "success",
      message: "Subscription cancelled successfully. You'll retain access until the end of your billing period.",
    };
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      status: "error",
      message: `Failed to cancel subscription: ${errorMessage}`,
    };
  }
}

export async function upgradeSubscription(
  newPlanId: string
): Promise<ApiResponse & { checkoutUrl?: string }> {
  const user = await requireUser();

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: user.id,
    });

    if (decision.isDenied()) {
      return {
        status: "error",
        message: "You have been blocked",
      };
    }

    // Get the new plan
    const newPlan = await prisma.subscriptionPlan.findUnique({
      where: {
        id: newPlanId,
        isActive: true,
      },
    });

    if (!newPlan) {
      return {
        status: "error",
        message: "Subscription plan not found",
      };
    }

    // Get user's current subscription
    const currentSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ["Active", "Trial"],
        },
      },
      include: {
        plan: true,
      },
    });

    if (!currentSubscription) {
      return {
        status: "error",
        message: "No active subscription found. Please subscribe first.",
      };
    }

    if (currentSubscription.planId === newPlanId) {
      return {
        status: "error",
        message: "You are already subscribed to this plan",
      };
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;
    const userWithStripeCustomerId = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        stripeCustomerId: true,
      },
    });

    if (userWithStripeCustomerId?.stripeCustomerId) {
      stripeCustomerId = userWithStripeCustomerId.stripeCustomerId;
    } else {
      const stripeCustomerName =
        [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
        user.email.split("@")[0];

      const customer = await stripe.customers.create({
        email: user.email,
        name: stripeCustomerName,
        metadata: {
          userId: user.id,
        },
      });

      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          stripeCustomerId: stripeCustomerId,
        },
      });
    }

    // If user has a Stripe subscription, update it
    if (currentSubscription.stripeSubscriptionId) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          currentSubscription.stripeSubscriptionId
        );

        const newPriceId =
          currentSubscription.billingCycle === "Yearly"
            ? newPlan.stripePriceIdYearly
            : newPlan.stripePriceIdMonthly;

        if (!newPriceId) {
          return {
            status: "error",
            message: "Stripe price not configured for this plan",
          };
        }

        // Update subscription in Stripe
        await stripe.subscriptions.update(currentSubscription.stripeSubscriptionId, {
          items: [
            {
              id: stripeSubscription.items.data[0].id,
              price: newPriceId,
            },
          ],
          proration_behavior: "always_invoice",
          metadata: {
            userId: user.id,
            planId: newPlan.id,
            billingCycle: currentSubscription.billingCycle,
          },
        });

        // Update in database
        await prisma.userSubscription.update({
          where: {
            id: currentSubscription.id,
          },
          data: {
            planId: newPlan.id,
            autoRenew: true,
            cancelledAt: null,
          },
        });

        // Create history record
        await prisma.subscriptionHistory.create({
          data: {
            userId: user.id,
            subscriptionId: currentSubscription.id,
            action: "Upgraded",
            oldPlanId: currentSubscription.planId,
            newPlanId: newPlan.id,
          },
        });

        return {
          status: "success",
          message: "Subscription upgraded successfully",
        };
      } catch (error) {
        console.error("Error upgrading Stripe subscription:", error);
        // Fall through to create new checkout session
      }
    }

    // If no Stripe subscription or update failed, create checkout session
    const stripePriceId =
      currentSubscription.billingCycle === "Yearly"
        ? newPlan.stripePriceIdYearly
        : newPlan.stripePriceIdMonthly;

    if (!stripePriceId) {
      return {
        status: "error",
        message: "Stripe price not configured for this plan",
      };
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/payment/success?type=subscription`,
      cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/pricing`,
      metadata: {
        userId: user.id,
        planId: newPlan.id,
        billingCycle: currentSubscription.billingCycle,
        isUpgrade: "true",
        oldSubscriptionId: currentSubscription.id,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: newPlan.id,
          billingCycle: currentSubscription.billingCycle,
        },
      },
    });

    return {
      status: "success",
      message: "Redirecting to checkout",
      checkoutUrl: checkoutSession.url || undefined,
    };
  } catch (error) {
    console.error("Failed to upgrade subscription:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      status: "error",
      message: `Failed to upgrade subscription: ${errorMessage}`,
    };
  }
}

