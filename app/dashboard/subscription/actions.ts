"use server";

import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";

export async function cancelSubscription(): Promise<ApiResponse> {
  const user = await requireUser();

  try {
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
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      } catch (error) {
        console.error("Failed to cancel Stripe subscription:", error);
        // Continue with database update even if Stripe fails
      }
    }

    // Update subscription in database
    await prisma.$transaction(async (tx) => {
      await tx.userSubscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: "Cancelled",
          autoRenew: false,
          cancelledAt: new Date(),
        },
      });

      // Log to history
      await tx.subscriptionHistory.create({
        data: {
          userId: user.id,
          subscriptionId: subscription.id,
          action: "Cancelled",
          oldPlanId: subscription.planId,
        },
      });
    });

    return {
      status: "success",
      message: "Subscription cancelled successfully. You'll retain access until the end of your billing period.",
    };
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return {
      status: "error",
      message: "Failed to cancel subscription. Please try again or contact support.",
    };
  }
}

export async function resumeSubscription(): Promise<ApiResponse> {
  const user = await requireUser();

  try {
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: "Cancelled",
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return {
        status: "error",
        message: "No cancelled subscription found",
      };
    }

    // Resume in Stripe if subscription exists
    if (subscription.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: false,
        });
      } catch (error) {
        console.error("Failed to resume Stripe subscription:", error);
        // Continue with database update even if Stripe fails
      }
    }

    // Update subscription in database
    await prisma.$transaction(async (tx) => {
      await tx.userSubscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: "Active",
          autoRenew: true,
          cancelledAt: null,
        },
      });

      // Log to history
      await tx.subscriptionHistory.create({
        data: {
          userId: user.id,
          subscriptionId: subscription.id,
          action: "Reactivated",
          oldPlanId: subscription.planId,
        },
      });
    });

    return {
      status: "success",
      message: "Subscription resumed successfully",
    };
  } catch (error) {
    console.error("Failed to resume subscription:", error);
    return {
      status: "error",
      message: "Failed to resume subscription. Please try again or contact support.",
    };
  }
}

export async function changeSubscriptionPlan(newPlanId: string): Promise<ApiResponse> {
  const user = await requireUser();

  try {
    // Get current subscription
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
        message: "No active subscription found",
      };
    }

    // Get new plan
    const newPlan = await prisma.subscriptionPlan.findUnique({
      where: {
        id: newPlanId,
        isActive: true,
      },
    });

    if (!newPlan) {
      return {
        status: "error",
        message: "New plan not found",
      };
    }

    if (currentSubscription.planId === newPlanId) {
      return {
        status: "error",
        message: "You are already on this plan",
      };
    }

    // Determine if upgrade or downgrade
    const isUpgrade = newPlan.priceMonthly > currentSubscription.plan.priceMonthly;

    // Update subscription in Stripe if exists
    if (currentSubscription.stripeSubscriptionId) {
      const stripePriceId =
        currentSubscription.billingCycle === "Yearly"
          ? newPlan.stripePriceIdYearly
          : newPlan.stripePriceIdMonthly;

      if (stripePriceId) {
        try {
          await stripe.subscriptions.update(currentSubscription.stripeSubscriptionId, {
            items: [
              {
                id: (await stripe.subscriptions.retrieve(currentSubscription.stripeSubscriptionId))
                  .items.data[0].id,
                price: stripePriceId,
              },
            ],
            proration_behavior: isUpgrade ? "always_invoice" : "none",
          });
        } catch (error) {
          console.error("Failed to update Stripe subscription:", error);
          return {
            status: "error",
            message: "Failed to update subscription in payment system. Please contact support.",
          };
        }
      }
    }

    // Update subscription in database
    await prisma.$transaction(async (tx) => {
      await tx.userSubscription.update({
        where: {
          id: currentSubscription.id,
        },
        data: {
          planId: newPlanId,
        },
      });

      // Log to history
      await tx.subscriptionHistory.create({
        data: {
          userId: user.id,
          subscriptionId: currentSubscription.id,
          action: isUpgrade ? "Upgraded" : "Downgraded",
          oldPlanId: currentSubscription.planId,
          newPlanId: newPlanId,
        },
      });
    });

    return {
      status: "success",
      message: `Plan ${isUpgrade ? "upgraded" : "downgraded"} successfully`,
    };
  } catch (error) {
    console.error("Failed to change subscription plan:", error);
    return {
      status: "error",
      message: "Failed to change plan. Please try again or contact support.",
    };
  }
}

