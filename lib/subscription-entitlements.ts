import "server-only";

/**
 * Subscription plan entitlements
 * These are defined in code (version control) and control access & limits.
 * Stripe controls payment, your app controls access & limits.
 */
export const PLAN_ENTITLEMENTS = {
  PERSONAL: {
    features: {
      certificates: true,
      downloads: true,
      team_roles: false,
      sso: false,
      api_access: false,
    },
    limits: {
      max_instructors: 1,
      max_students: 300,
      max_courses: 20,
      storage_gb: 50,
      emails_per_month: 5000,
    },
  },
  TEAM: {
    features: {
      certificates: true,
      downloads: true,
      team_roles: true,
      sso: false,
      api_access: true,
    },
    limits: {
      max_instructors: 10,
      max_students: 5000,
      max_courses: 200,
      storage_gb: 500,
      emails_per_month: 50000,
    },
  },
  ENTERPRISE: {
    features: {
      certificates: true,
      downloads: true,
      team_roles: true,
      sso: true,
      api_access: true,
    },
    limits: {
      max_instructors: 9999,
      max_students: 999999,
      max_courses: 999999,
      storage_gb: 9999,
      emails_per_month: 999999,
    },
  },
} as const;

export type PlanCode = keyof typeof PLAN_ENTITLEMENTS;
export type FeatureKey = keyof typeof PLAN_ENTITLEMENTS.PERSONAL.features;
export type LimitKey = keyof typeof PLAN_ENTITLEMENTS.PERSONAL.limits;

/**
 * Get entitlements for a plan code
 */
export function getPlanEntitlements(planCode: PlanCode) {
  return PLAN_ENTITLEMENTS[planCode];
}

/**
 * Check if a plan has a specific feature
 */
export function hasFeature(planCode: PlanCode | null, feature: FeatureKey): boolean {
  if (!planCode) return false;
  return PLAN_ENTITLEMENTS[planCode]?.features[feature] ?? false;
}

/**
 * Get a limit value for a plan
 */
export function getLimit(planCode: PlanCode | null, limit: LimitKey): number {
  if (!planCode) return 0;
  return PLAN_ENTITLEMENTS[planCode]?.limits[limit] ?? 0;
}

/**
 * Check if a value is within the plan's limit
 */
export function isWithinLimit(
  planCode: PlanCode | null,
  limit: LimitKey,
  currentValue: number
): boolean {
  const maxValue = getLimit(planCode, limit);
  // 9999+ means unlimited
  if (maxValue >= 9999) return true;
  return currentValue < maxValue;
}

