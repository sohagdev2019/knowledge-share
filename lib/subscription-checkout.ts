import "server-only";
import { prisma } from "./db";
import { env } from "./env";
import { stripe } from "./stripe";
import { getStripePriceId, getOrCreateOrganization } from "./subscription-utils";
import type { PlanCode } from "./subscription-entitlements";

/**
 * Create Stripe checkout session for subscription
 */
export async function createSubscriptionCheckout(
  userId: string,
  planCode: PlanCode,
  billingCycle: "monthly" | "yearly",
  successUrl?: string,
  cancelUrl?: string
) {
  // Get user from database to get email
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true, lastName: true, stripeCustomerId: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get or create organization for user
  const org = await getOrCreateOrganization(userId);

  // Get Stripe price ID
  const priceId = getStripePriceId(planCode, billingCycle);
  if (!priceId) {
    throw new Error(`Price ID not configured for ${planCode} ${billingCycle}`);
  }

  // Get or create Stripe customer
  let customerId: string;
  if (user.stripeCustomerId) {
    customerId = user.stripeCustomerId;
  } else {
    // Search for existing customer by email
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      // Update user with customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    } else {
      // Create new customer
      const customerName = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || user.email.split("@")[0];

      const customer = await stripe.customers.create({
        email: user.email,
        name: customerName,
        metadata: {
          userId,
          orgId: org.id,
        },
      });
      customerId = customer.id;

      // Update user with customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      orgId: org.id,
      planCode,
      billingCycle,
    },
    success_url:
      successUrl ||
      `${env.NEXTAUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:
      cancelUrl ||
      `${env.NEXTAUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"}/subscription/cancel`,
    subscription_data: {
      metadata: {
        orgId: org.id,
        planCode,
      },
    },
  });

  return {
    sessionId: session.id,
    url: session.url,
  };
}

