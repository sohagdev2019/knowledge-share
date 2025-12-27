"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Lock, TrendingUp, Rocket, BarChart3 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useABTest } from "./ABTestProvider";
import { useEffect } from "react";
import { Variant } from "@/lib/ab-testing";

interface HardLockMessageProps {
  type: "courses" | "students" | "storage";
  limit: number;
  planName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HardLockMessage({
  type,
  limit,
  planName,
  open,
  onOpenChange,
}: HardLockMessageProps) {
  const { headlineTone, ctaLabel, reassurancePlacement, trackEvent } = useABTest();

  // Track modal view
  useEffect(() => {
    if (open) {
      trackEvent("headline_tone", headlineTone, "view", { type, limit, planName });
    }
  }, [open, headlineTone, type, limit, planName, trackEvent]);

  // Headline variants (Test 1: Emotion vs Logic)
  const headlineVariants = {
    courses: {
      A: "Course limit reached", // Informational
      B: "You're growing fast — unlock more courses", // Growth-focused
    },
    students: {
      A: "Student limit reached",
      B: "You're growing fast — unlock more students",
    },
    storage: {
      A: "Storage limit reached",
      B: "You're growing fast — unlock more storage",
    },
  };

  // CTA label variants (Test 3)
  const ctaVariants = {
    A: "Upgrade Plan",
    B: "Unlock Pro Features",
    C: "Grow My Teaching",
  };

  const baseMessages = {
    courses: {
      description: `You've reached your course limit on ${planName} plan (${limit} courses).`,
      upgradeTitle: "Unlock up to 15 courses with Pro Teacher",
      upgradeDescription: "Your existing courses stay active. No data will be lost.",
    },
    students: {
      description: `You've reached your student limit on ${planName} plan (${limit} students).`,
      upgradeTitle: "Unlock up to 500 students with Pro Teacher",
      upgradeDescription: "Existing students will not be affected. Upgrade to continue enrolling.",
    },
    storage: {
      description: `You've reached your storage limit on ${planName} plan.`,
      upgradeTitle: "Unlock 20GB storage with Pro Teacher",
      upgradeDescription: "Your existing files are safe. Upgrade to upload more content.",
    },
  };

  const message = baseMessages[type];
  const headline = headlineVariants[type][headlineTone];
  const ctaText = ctaVariants[ctaLabel];

  // Icon variants (Test 8: Lock vs Growth)
  const IconComponent = headlineTone === "B" ? Rocket : Lock;
  const iconColor = headlineTone === "B" ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400";
  const iconBg = headlineTone === "B" ? "bg-blue-100 dark:bg-blue-900/20" : "bg-red-100 dark:bg-red-900/20";

  const handleUpgradeClick = () => {
    trackEvent("cta_label", ctaLabel, "click", { type, limit, planName });
    trackEvent("headline_tone", headlineTone, "conversion", { type, limit, planName });
  };

  const handleDismiss = () => {
    trackEvent("headline_tone", headlineTone, "dismiss", { type, limit, planName });
    onOpenChange(false);
  };

  // Reassurance message
  const reassuranceText = message.upgradeDescription;

  return (
    <AlertDialog open={open} onOpenChange={handleDismiss}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`rounded-full ${iconBg} p-2`}>
              <IconComponent className={`h-5 w-5 ${iconColor}`} />
            </div>
            <AlertDialogTitle className="text-lg">
              {headline}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {message.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
            {message.upgradeTitle}
          </h4>
          {/* Reassurance placement variant (Test 5) */}
          {reassurancePlacement === "A" && (
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {reassuranceText}
            </p>
          )}
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={handleDismiss}>Maybe Later</AlertDialogCancel>
          <Link href="/pricing" className="w-full sm:w-auto" onClick={handleUpgradeClick}>
            <AlertDialogAction asChild className="w-full">
              <Button className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                {ctaText}
              </Button>
            </AlertDialogAction>
          </Link>
          {/* Reassurance placement variant B: Directly under CTA */}
          {reassurancePlacement === "B" && (
            <p className="text-xs text-muted-foreground text-center w-full sm:w-auto">
              {reassuranceText}
            </p>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Inline hard lock message (for buttons/actions)
 */
export function InlineHardLock({
  type,
  limit,
  planName,
}: {
  type: "courses" | "students" | "storage";
  limit: number;
  planName: string;
}) {
  const messages = {
    courses: `🚫 Course limit reached on ${planName} plan`,
    students: `🚫 Student limit reached on ${planName} plan`,
    storage: `🚫 Storage limit reached on ${planName} plan`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-red-900 dark:text-red-100">
            {messages[type]}
          </p>
          <p className="text-sm text-red-800 dark:text-red-200 mt-1">
            Upgrade your plan to continue. Your existing content is safe.
          </p>
          <Link href="/pricing" className="inline-block mt-2">
            <Button size="sm" variant="outline" className="border-red-300 dark:border-red-700">
              <TrendingUp className="h-3 w-3 mr-2" />
              Upgrade Now
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

