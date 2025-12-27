"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";
import { request } from "@arcjet/next";
import { isAdminPlan } from "@/lib/plan-utils";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 5,
  })
);

export async function cancelAdminSubscription(
  reason?: string
): Promise<ApiResponse> {
  const session = await requireAdmin();

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session.user.id,
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
        userId: session.user.id,
        status: {
          in: ["Active", "Trial"],
        },
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return {
        status: "error",
        message: "No active subscription found",
      };
    }

    // Verify it's a teacher plan
    if (!isAdminPlan(subscription.plan)) {
      return {
        status: "error",
        message: "This subscription is not a teacher plan",
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

    // Create history record with cancellation reason
    await prisma.subscriptionHistory.create({
      data: {
        userId: session.user.id,
        subscriptionId: subscription.id,
        action: "Cancelled",
        oldPlanId: subscription.planId,
        metadata: reason ? { cancellationReason: reason } : null,
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

export async function upgradeAdminSubscription(
  newPlanId: string
): Promise<ApiResponse & { checkoutUrl?: string }> {
  const session = await requireAdmin();

  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session.user.id,
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

    // Verify it's a teacher plan
    if (!isAdminPlan(newPlan)) {
      return {
        status: "error",
        message: "Admin accounts can only subscribe to teacher plans",
      };
    }

    // Get user's current subscription
    const currentSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: session.user.id,
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
        id: session.user.id,
      },
      select: {
        stripeCustomerId: true,
      },
    });

    if (userWithStripeCustomerId?.stripeCustomerId) {
      stripeCustomerId = userWithStripeCustomerId.stripeCustomerId;
    } else {
      const stripeCustomerName =
        [session.user.firstName, session.user.lastName].filter(Boolean).join(" ").trim() ||
        session.user.email.split("@")[0];

      const customer = await stripe.customers.create({
        email: session.user.email,
        name: stripeCustomerName,
        metadata: {
          userId: session.user.id,
        },
      });

      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: {
          id: session.user.id,
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
            userId: session.user.id,
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
            userId: session.user.id,
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
      cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/admin/subscription`,
      metadata: {
        userId: session.user.id,
        planId: newPlan.id,
        billingCycle: currentSubscription.billingCycle,
        isUpgrade: "true",
        oldSubscriptionId: currentSubscription.id,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
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

