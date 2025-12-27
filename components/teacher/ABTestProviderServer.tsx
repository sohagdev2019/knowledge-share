import { ABTestProvider } from "./ABTestProvider";
import { getVariant, AB_TESTS, Variant } from "@/lib/ab-testing";
import { ReactNode } from "react";

interface ABTestProviderServerProps {
  children: ReactNode;
}

export async function ABTestProviderServer({ children }: ABTestProviderServerProps) {
  // Get variants for all tests (read-only, cookies set on client side if needed)
  const headlineTone = await getVariant(
    AB_TESTS.HEADLINE_TONE.testName,
    AB_TESTS.HEADLINE_TONE.variants,
    AB_TESTS.HEADLINE_TONE.defaultVariant
  );

  const ctaLabel = await getVariant(
    AB_TESTS.CTA_LABEL.testName,
    AB_TESTS.CTA_LABEL.variants,
    AB_TESTS.CTA_LABEL.defaultVariant
  );

  const reassurancePlacement = await getVariant(
    AB_TESTS.REASSURANCE_PLACEMENT.testName,
    AB_TESTS.REASSURANCE_PLACEMENT.variants,
    AB_TESTS.REASSURANCE_PLACEMENT.defaultVariant
  );

  const planComparison = await getVariant(
    AB_TESTS.PLAN_COMPARISON.testName,
    AB_TESTS.PLAN_COMPARISON.variants,
    AB_TESTS.PLAN_COMPARISON.defaultVariant
  );

  return (
    <ABTestProvider
      headlineTone={headlineTone}
      ctaLabel={ctaLabel}
      reassurancePlacement={reassurancePlacement}
      planComparison={planComparison}
    >
      {children}
    </ABTestProvider>
  );
}

