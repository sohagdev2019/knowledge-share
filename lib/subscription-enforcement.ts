import "server-only";
import { prisma } from "./db";
import {
  getLimit,
  getPlanEntitlements,
  hasFeature,
  isWithinLimit,
  type FeatureKey,
  type LimitKey,
  type PlanCode,
} from "./subscription-entitlements";

export interface SubscriptionCheckResult {
  allowed: boolean;
  error?: {
    code: string;
    message: string;
    planNeeded?: PlanCode;
  };
}

/**
 * Check if organization has access based on subscription status
 */
function checkSubscriptionStatus(
  status: string | null
): { allowed: boolean; error?: SubscriptionCheckResult["error"] } {
  // Allow access for active and trialing subscriptions
  if (status === "active" || status === "trialing") {
    return { allowed: true };
  }

  // Past due: allow with grace period (you can customize this)
  if (status === "past_due") {
    // You can add grace period logic here
    // For now, we'll allow but you might want to block premium actions
    return { allowed: true };
  }

  // Canceled/expired: read-only access
  if (status === "canceled" || status === "expired" || status === "incomplete") {
    return {
      allowed: false,
      error: {
        code: "subscription_required",
        message: "Subscription required to access this feature",
      },
    };
  }

  // No subscription
  return {
    allowed: false,
    error: {
      code: "subscription_required",
      message: "Subscription required to access this feature",
    },
  };
}

/**
 * Check if organization has a specific feature
 */
export async function checkFeature(
  orgId: string,
  feature: FeatureKey
): Promise<SubscriptionCheckResult> {
  const subscription = await prisma.subscription.findUnique({
    where: { orgId },
  });

  // Check subscription status first
  const statusCheck = checkSubscriptionStatus(subscription?.status || null);
  if (!statusCheck.allowed) {
    return statusCheck;
  }

  const planCode = (subscription?.planCode as PlanCode) || null;

  if (!planCode) {
    return {
      allowed: false,
      error: {
        code: "subscription_required",
        message: "Subscription required to access this feature",
      },
    };
  }

  const hasAccess = hasFeature(planCode, feature);

  if (!hasAccess) {
    // Determine which plan is needed
    let planNeeded: PlanCode = "TEAM";
    if (feature === "sso") {
      planNeeded = "ENTERPRISE";
    } else if (feature === "team_roles" || feature === "api_access") {
      planNeeded = "TEAM";
    }

    return {
      allowed: false,
      error: {
        code: "feature_not_available",
        message: `This feature requires ${planNeeded} plan`,
        planNeeded,
      },
    };
  }

  return { allowed: true };
}

/**
 * Check if organization is within a limit
 */
export async function checkLimit(
  orgId: string,
  limit: LimitKey,
  currentValue: number
): Promise<SubscriptionCheckResult> {
  const subscription = await prisma.subscription.findUnique({
    where: { orgId },
  });

  // Check subscription status first
  const statusCheck = checkSubscriptionStatus(subscription?.status || null);
  if (!statusCheck.allowed) {
    return statusCheck;
  }

  const planCode = (subscription?.planCode as PlanCode) || null;

  if (!planCode) {
    return {
      allowed: false,
      error: {
        code: "subscription_required",
        message: "Subscription required",
      },
    };
  }

  const withinLimit = isWithinLimit(planCode, limit, currentValue);

  if (!withinLimit) {
    const maxValue = getLimit(planCode, limit);
    return {
      allowed: false,
      error: {
        code: "limit_exceeded",
        message: `Limit exceeded. Maximum ${limit}: ${maxValue >= 9999 ? "unlimited" : maxValue}`,
      },
    };
  }

  return { allowed: true };
}

/**
 * Get current usage count for a limit key
 * This is a helper to get the current count before checking limits
 */
export async function getCurrentUsage(
  orgId: string,
  limit: LimitKey
): Promise<number> {
  // This is a simplified version - you might want to query actual counts
  // For example, for max_students, count actual students
  // For max_courses, count actual courses
  // For max_instructors, count actual instructors

  switch (limit) {
    case "max_students":
      // Count enrollments or students in the org
      // This is a placeholder - implement based on your data model
      return 0;
    case "max_courses":
      // Count courses in the org
      // This is a placeholder - implement based on your data model
      return 0;
    case "max_instructors":
      // Count instructors in the org
      // This is a placeholder - implement based on your data model
      return 0;
    case "storage_gb":
      // Get storage usage from UsageCounter or calculate from files
      const storageCounter = await prisma.usageCounter.findFirst({
        where: {
          orgId,
          key: "storage_gb",
          periodStart: { lte: new Date() },
          periodEnd: { gte: new Date() },
        },
      });
      return storageCounter?.count || 0;
    case "emails_per_month":
      // Get email count from UsageCounter
      const emailCounter = await prisma.usageCounter.findFirst({
        where: {
          orgId,
          key: "emails_per_month",
          periodStart: { lte: new Date() },
          periodEnd: { gte: new Date() },
        },
      });
      return emailCounter?.count || 0;
    default:
      return 0;
  }
}

/**
 * Increment usage counter
 */
export async function incrementUsage(
  orgId: string,
  key: string,
  amount: number = 1
): Promise<void> {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  await prisma.usageCounter.upsert({
    where: {
      orgId_key_periodStart: {
        orgId,
        key,
        periodStart,
      },
    },
    update: {
      count: { increment: amount },
    },
    create: {
      orgId,
      key,
      periodStart,
      periodEnd,
      count: amount,
    },
  });
}

