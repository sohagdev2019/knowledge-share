"use server";

import { requireUser } from "@/app/data/user/require-user";
import { canSubscribeToUserPlans } from "@/lib/role-access";
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
  
  // Check if user can subscribe (only regular users can)
  const canSubscribe = await canSubscribeToUserPlans();
  if (!canSubscribe) {
    return {
      status: "error",
      message: "Admin accounts cannot manage user subscriptions. Please contact support for admin subscription management.",
    };
  }

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
  
  // Check if user can subscribe (only regular users can)
  const canSubscribe = await canSubscribeToUserPlans();
  if (!canSubscribe) {
    return {
      status: "error",
      message: "Admin accounts cannot subscribe to user plans. Admin accounts require a different subscription plan.",
    };
  }

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

    // Always create a checkout session for upgrades to ensure payment is processed
    // This ensures proper payment flow, invoice generation, and webhook handling
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

    // For upgrades, we need to handle the existing subscription
    // Option 1: Cancel old subscription and create new one (cleaner)
    // Option 2: Use Stripe's subscription update (but requires immediate payment)
    // We'll use Option 1 to ensure proper checkout flow
    
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/payment/success?type=subscription&upgrade=true`,
      cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/pricing`,
      metadata: {
        userId: user.id,
        planId: newPlan.id,
        billingCycle: currentSubscription.billingCycle,
        isUpgrade: "true",
        oldSubscriptionId: currentSubscription.id,
        oldPlanId: currentSubscription.planId,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: newPlan.id,
          billingCycle: currentSubscription.billingCycle,
          isUpgrade: "true",
          oldSubscriptionId: currentSubscription.id,
        },
      },
      // If user has existing subscription, we'll cancel it after successful checkout
      // This is handled in the webhook
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

