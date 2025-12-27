"use server";

import { requireUser } from "@/app/data/user/require-user";
import { getUserRole } from "@/lib/role-access";
import { isAdminPlan } from "@/lib/plan-utils";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
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

interface CreateSubscriptionCheckoutParams {
  planId: string;
  billingCycle: "monthly" | "yearly";
  couponCode?: string;
}

export async function createSubscriptionCheckout(
  params: CreateSubscriptionCheckoutParams
): Promise<ApiResponse & { checkoutUrl?: string }> {
  const user = await requireUser();
  const userRole = await getUserRole();
  
  // SuperAdmin: cannot subscribe
  if (userRole === "superadmin") {
    return {
      status: "error",
      message: "Super Admin accounts do not require subscriptions.",
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

    // Get the subscription plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: {
        id: params.planId,
        isActive: true,
      },
    });

    if (!plan) {
      return {
        status: "error",
        message: "Subscription plan not found",
      };
    }

    // Check if user can subscribe to this plan type
    const planIsTeacherPlan = isAdminPlan(plan);
    
    // Admin: only allow teacher plans
    if (userRole === "admin" && !planIsTeacherPlan) {
      return {
        status: "error",
        message: "Teacher accounts cannot subscribe to student plans.",
      };
    }

    // User: only allow student plans
    if (userRole === "user" && planIsTeacherPlan) {
      return {
        status: "error",
        message: "Student accounts cannot subscribe to teacher plans.",
      };
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ["Active", "Trial"],
        },
      },
    });

    if (existingSubscription && existingSubscription.planId === plan.id) {
      return {
        status: "error",
        message: "You already have an active subscription to this plan",
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

    // Get the appropriate Stripe price ID
    const stripePriceId =
      params.billingCycle === "yearly"
        ? plan.stripePriceIdYearly
        : plan.stripePriceIdMonthly;

    if (!stripePriceId) {
      return {
        status: "error",
        message: "Stripe price not configured for this plan. Please contact support.",
      };
    }

    // Validate coupon if provided
    let couponId: string | undefined;
    if (params.couponCode) {
      const now = new Date();
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: params.couponCode.toUpperCase(),
          isActive: true,
          validFrom: {
            lte: now,
          },
          OR: [
            { validUntil: null },
            { validUntil: { gte: now } },
          ],
          OR: [
            { appliesToAllPlans: true },
            { planIds: { has: params.planId } },
          ],
        },
      });

      // Check if coupon is valid and not exceeded usage limit
      if (
        coupon &&
        (!coupon.maxUses || coupon.usedCount < coupon.maxUses)
      ) {
        // Create Stripe coupon if it doesn't exist
        try {
          const stripeCoupon = await stripe.coupons.create({
            id: coupon.code,
            percent_off:
              coupon.discountType === "Percentage" ? coupon.discountValue : undefined,
            amount_off:
              coupon.discountType === "FixedAmount"
                ? coupon.discountValue
                : undefined,
            currency: "usd",
            duration: "forever",
          });
          couponId = stripeCoupon.id;
        } catch (error: any) {
          // Coupon might already exist, try to retrieve it
          if (error.code === "resource_already_exists") {
            couponId = coupon.code;
          }
        }
      }
    }

    // Create Stripe checkout session for subscription
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${env.NEXTAUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/payment/success?type=subscription`,
      cancel_url: `${env.NEXTAUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/checkout?plan=${plan.slug}&billing=${params.billingCycle}`,
      metadata: {
        userId: user.id,
        planId: plan.id,
        billingCycle: params.billingCycle,
        ...(params.couponCode && { couponCode: params.couponCode }),
      },
      ...(couponId && { discounts: [{ coupon: couponId }] }),
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: plan.id,
          billingCycle: params.billingCycle,
        },
      },
    });

    return {
      status: "success",
      message: "Checkout session created",
      checkoutUrl: checkoutSession.url || undefined,
    };
  } catch (error) {
    console.error("Failed to create subscription checkout:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      status: "error",
      message: `Failed to create checkout: ${errorMessage}`,
    };
  }
}

