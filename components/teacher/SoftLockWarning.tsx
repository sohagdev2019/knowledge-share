"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Rocket } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useABTest } from "./ABTestProvider";
import { useEffect } from "react";

interface SoftLockWarningProps {
  type: "courses" | "students" | "storage";
  used: number;
  limit: number;
  percentageUsed: number;
  planName: string;
}

export function SoftLockWarning({
  type,
  used,
  limit,
  percentageUsed,
  planName,
}: SoftLockWarningProps) {
  const { headlineTone, ctaLabel, trackEvent } = useABTest();

  // Track warning view
  useEffect(() => {
    trackEvent("headline_tone", headlineTone, "view", { type, used, limit, planName, percentageUsed });
  }, [headlineTone, type, used, limit, planName, percentageUsed, trackEvent]);

  // Headline variants (Test 1)
  const headlineVariants = {
    courses: {
      A: `You've created ${used} of ${limit} courses`, // Informational
      B: `You're growing fast — ${used} of ${limit} courses created`, // Growth-focused
    },
    students: {
      A: `You're close to your student limit (${used}/${limit})`,
      B: `You're growing fast — ${used} of ${limit} students enrolled`,
    },
    storage: {
      A: `Storage almost full (${(used / 1024).toFixed(1)}GB of ${(limit / 1024).toFixed(1)}GB used)`,
      B: `You're growing fast — ${(used / 1024).toFixed(1)}GB of ${(limit / 1024).toFixed(1)}GB used`,
    },
  };

  // CTA label variants (Test 3)
  const ctaVariants = {
    A: "Upgrade to Pro",
    B: "Unlock Pro Features",
    C: "Grow My Teaching",
  };

  const baseMessages = {
    courses: {
      description: "Upgrade to Pro Teacher to publish more courses.",
    },
    students: {
      description: "Upgrade to enroll more learners and grow your teaching business.",
    },
    storage: {
      description: "Upgrade for more space to upload more videos and files.",
    },
  };

  const message = baseMessages[type];
  const headline = headlineVariants[type][headlineTone];
  const ctaText = ctaVariants[ctaLabel];

  const handleUpgradeClick = () => {
    trackEvent("cta_label", ctaLabel, "click", { type, used, limit, planName });
    trackEvent("headline_tone", headlineTone, "conversion", { type, used, limit, planName });
  };

  // Icon variant (Test 8)
  const IconComponent = headlineTone === "B" ? Rocket : AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Alert className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
        <IconComponent className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle className="text-yellow-900 dark:text-yellow-100">
          {headline}
        </AlertTitle>
        <AlertDescription className="text-yellow-800 dark:text-yellow-200 mt-2">
          {message.description}
        </AlertDescription>
        <div className="mt-3">
          <Link href="/pricing" onClick={handleUpgradeClick}>
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-300 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-900"
            >
              <TrendingUp className="h-3 w-3 mr-2" />
              {ctaText}
            </Button>
          </Link>
        </div>
      </Alert>
    </motion.div>
  );
}

