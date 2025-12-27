import "server-only";
import { prisma } from "./db";
import { env } from "./env";
import { stripe } from "./stripe";
import type { PlanCode } from "./subscription-entitlements";

/**
 * Map Stripe price ID to plan code
 */
export function mapPriceIdToPlanCode(priceId: string): PlanCode | null {
  const priceMap: Record<string, PlanCode> = {
    [env.STRIPE_PRICE_PERSONAL_MONTHLY || ""]: "PERSONAL",
    [env.STRIPE_PRICE_PERSONAL_YEARLY || ""]: "PERSONAL",
    [env.STRIPE_PRICE_TEAM_MONTHLY || ""]: "TEAM",
    [env.STRIPE_PRICE_TEAM_YEARLY || ""]: "TEAM",
    [env.STRIPE_PRICE_ENTERPRISE_MONTHLY || ""]: "ENTERPRISE",
    [env.STRIPE_PRICE_ENTERPRISE_YEARLY || ""]: "ENTERPRISE",
  };

  return priceMap[priceId] || null;
}

/**
 * Get Stripe price ID for a plan and billing cycle
 */
export function getStripePriceId(
  planCode: PlanCode,
  billingCycle: "monthly" | "yearly"
): string | null {
  const priceMap: Record<string, string | undefined> = {
    PERSONAL_MONTHLY: env.STRIPE_PRICE_PERSONAL_MONTHLY,
    PERSONAL_YEARLY: env.STRIPE_PRICE_PERSONAL_YEARLY,
    TEAM_MONTHLY: env.STRIPE_PRICE_TEAM_MONTHLY,
    TEAM_YEARLY: env.STRIPE_PRICE_TEAM_YEARLY,
    ENTERPRISE_MONTHLY: env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    ENTERPRISE_YEARLY: env.STRIPE_PRICE_ENTERPRISE_YEARLY,
  };

  const key = `${planCode}_${billingCycle.toUpperCase()}` as keyof typeof priceMap;
  return priceMap[key] || null;
}

/**
 * Get organization subscription
 */
export async function getOrgSubscription(orgId: string) {
  return prisma.subscription.findUnique({
    where: { orgId },
    include: {
      organization: {
        include: {
          owner: true,
        },
      },
    },
  });
}

/**
 * Get organization by ID
 */
export async function getOrganization(orgId: string) {
  return prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      owner: true,
      subscription: true,
    },
  });
}

/**
 * Create or get organization for a user
 */
export async function getOrCreateOrganization(userId: string, orgName?: string) {
  // Check if user already owns an organization
  const existing = await prisma.organization.findFirst({
    where: { ownerUserId: userId },
  });

  if (existing) {
    return existing;
  }

  // Create new organization
  return prisma.organization.create({
    data: {
      name: orgName || "My Organization",
      ownerUserId: userId,
    },
  });
}

