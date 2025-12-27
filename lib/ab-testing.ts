import "server-only";
import { cookies } from "next/headers";
import { isTestEnabled, getTestConfig, AB_TEST_CONFIG } from "./ab-test-config";

export type Variant = "A" | "B" | "C";

export interface ABTestConfig {
  testName: string;
  variants: Variant[];
  defaultVariant: Variant;
}

/**
 * Get variant from cookie (read-only, safe for Server Components)
 */
export async function getVariant(
  testName: string,
  variants: Variant[] = ["A", "B"],
  defaultVariant: Variant = "A"
): Promise<Variant> {
  // Check if test is enabled in config
  const testConfig = getTestConfig(testName as keyof typeof AB_TEST_CONFIG);
  if (testConfig && !testConfig.enabled) {
    return defaultVariant as Variant;
  }

  const cookieStore = await cookies();
  const cookieName = `ab_test_${testName}`;
  const existingVariant = cookieStore.get(cookieName)?.value as Variant | undefined;

  // If user already has a variant assigned, use it
  if (existingVariant && variants.includes(existingVariant)) {
    return existingVariant;
  }

  // If no variant exists, return default (cookie will be set on client side)
  return defaultVariant;
}

/**
 * Assign a new variant (for use in Route Handlers or Server Actions)
 * This function can modify cookies
 */
export async function assignVariant(
  testName: string,
  variants: Variant[] = ["A", "B"],
  defaultVariant: Variant = "A"
): Promise<Variant> {
  const cookieStore = await cookies();
  const cookieName = `ab_test_${testName}`;
  
  // Assign a new variant (simple 50/50 split for A/B, or equal distribution for A/B/C)
  const random = Math.random();
  let assignedVariant: Variant;

  if (variants.length === 2) {
    assignedVariant = random < 0.5 ? "A" : "B";
  } else if (variants.length === 3) {
    if (random < 0.33) {
      assignedVariant = "A";
    } else if (random < 0.66) {
      assignedVariant = "B";
    } else {
      assignedVariant = "C";
    }
  } else {
    assignedVariant = defaultVariant;
  }

  // Store in cookie (30 days expiry)
  cookieStore.set(cookieName, assignedVariant, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    httpOnly: false, // Allow client-side access for tracking
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return assignedVariant;
}

/**
 * Track an event for A/B testing analytics
 */
export async function trackABTestEvent(
  testName: string,
  variant: Variant,
  eventType: "view" | "click" | "conversion" | "dismiss",
  metadata?: Record<string, any>
) {
  // In production, you'd send this to your analytics service
  // For now, we'll log it and you can integrate with your analytics tool
  
  if (process.env.NODE_ENV === "development") {
    console.log("[AB Test Event]", {
      testName,
      variant,
      eventType,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }

  // TODO: Integrate with your analytics service (e.g., PostHog, Mixpanel, Google Analytics)
  // Example:
  // await analytics.track('ab_test_event', {
  //   test_name: testName,
  //   variant,
  //   event_type: eventType,
  //   ...metadata,
  // });
}

/**
 * A/B Test Configurations
 */
export const AB_TESTS = {
  HEADLINE_TONE: {
    testName: "headline_tone",
    variants: ["A", "B"] as Variant[],
    defaultVariant: "A" as Variant,
  },
  CTA_LABEL: {
    testName: "cta_label",
    variants: ["A", "B", "C"] as Variant[],
    defaultVariant: "A" as Variant,
  },
  REASSURANCE_PLACEMENT: {
    testName: "reassurance_placement",
    variants: ["A", "B"] as Variant[],
    defaultVariant: "A" as Variant,
  },
  PLAN_COMPARISON: {
    testName: "plan_comparison",
    variants: ["A", "B"] as Variant[],
    defaultVariant: "A" as Variant,
  },
} as const;

