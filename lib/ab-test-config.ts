/**
 * A/B Test Configuration
 * 
 * Use this file to easily toggle tests on/off and configure variants
 * without modifying component code.
 */

export interface TestConfig {
  enabled: boolean;
  variants: string[];
  defaultVariant: string;
  description: string;
}

export const AB_TEST_CONFIG = {
  /**
   * Test 1: Headline Tone (Emotion vs Logic)
   * Variant A: Informational ("Course limit reached")
   * Variant B: Growth-Focused ("You're growing fast — unlock more courses")
   */
  headline_tone: {
    enabled: true,
    variants: ["A", "B"],
    defaultVariant: "A",
    description: "Tests whether growth-focused headlines convert better than informational warnings",
  },

  /**
   * Test 3: CTA Label
   * Variant A: "Upgrade Plan"
   * Variant B: "Unlock Pro Features"
   * Variant C: "Grow My Teaching"
   */
  cta_label: {
    enabled: true,
    variants: ["A", "B", "C"],
    defaultVariant: "A",
    description: "Tests which CTA wording drives more conversions",
  },

  /**
   * Test 5: Reassurance Placement
   * Variant A: Bottom of modal (traditional placement)
   * Variant B: Directly under CTA (early reassurance)
   */
  reassurance_placement: {
    enabled: true,
    variants: ["A", "B"],
    defaultVariant: "A",
    description: "Tests whether early reassurance reduces hesitation",
  },

  /**
   * Test 6: Plan Comparison Depth
   * Variant A: Single recommended plan (Pro Teacher only)
   * Variant B: Starter vs Pro comparison table
   */
  plan_comparison: {
    enabled: false, // Disabled by default - implement when needed
    variants: ["A", "B"],
    defaultVariant: "A",
    description: "Tests whether showing comparison increases or decreases conversion",
  },
} as const;

/**
 * Helper to check if a test is enabled
 */
export function isTestEnabled(testName: keyof typeof AB_TEST_CONFIG): boolean {
  return AB_TEST_CONFIG[testName]?.enabled ?? false;
}

/**
 * Get test configuration
 */
export function getTestConfig(testName: keyof typeof AB_TEST_CONFIG): TestConfig | undefined {
  return AB_TEST_CONFIG[testName];
}

