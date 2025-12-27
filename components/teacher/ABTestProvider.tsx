"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { Variant } from "@/lib/ab-testing";

interface ABTestContextValue {
  headlineTone: Variant;
  ctaLabel: Variant;
  reassurancePlacement: Variant;
  planComparison: Variant;
  trackEvent: (
    testName: string,
    variant: Variant,
    eventType: "view" | "click" | "conversion" | "dismiss",
    metadata?: Record<string, any>
  ) => void;
}

const ABTestContext = createContext<ABTestContextValue | null>(null);

export function useABTest() {
  const context = useContext(ABTestContext);
  if (!context) {
    throw new Error("useABTest must be used within ABTestProvider");
  }
  return context;
}

interface ABTestProviderProps {
  children: ReactNode;
  headlineTone: Variant;
  ctaLabel: Variant;
  reassurancePlacement: Variant;
  planComparison: Variant;
}

/**
 * Set cookie on client side if it doesn't exist
 */
function setCookieIfNeeded(name: string, value: string, days: number = 30) {
  if (typeof document === "undefined") return;
  
  // Check if cookie already exists
  const existing = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  
  if (existing) return; // Cookie already exists
  
  // Set cookie
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

export function ABTestProvider({
  children,
  headlineTone,
  ctaLabel,
  reassurancePlacement,
  planComparison,
}: ABTestProviderProps) {
  // Set cookies on client side if they don't exist
  useEffect(() => {
    setCookieIfNeeded("ab_test_headline_tone", headlineTone);
    setCookieIfNeeded("ab_test_cta_label", ctaLabel);
    setCookieIfNeeded("ab_test_reassurance_placement", reassurancePlacement);
    setCookieIfNeeded("ab_test_plan_comparison", planComparison);
  }, [headlineTone, ctaLabel, reassurancePlacement, planComparison]);

  const trackEvent = async (
    testName: string,
    variant: Variant,
    eventType: "view" | "click" | "conversion" | "dismiss",
    metadata?: Record<string, any>
  ) => {
    // Client-side tracking
    if (typeof window !== "undefined") {
      // Send to analytics service
      try {
        // Example: PostHog, Mixpanel, or custom endpoint
        await fetch("/api/analytics/ab-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            testName,
            variant,
            eventType,
            metadata,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (error) {
        console.error("Failed to track AB test event:", error);
      }
    }
  };

  return (
    <ABTestContext.Provider
      value={{
        headlineTone,
        ctaLabel,
        reassurancePlacement,
        planComparison,
        trackEvent,
      }}
    >
      {children}
    </ABTestContext.Provider>
  );
}

