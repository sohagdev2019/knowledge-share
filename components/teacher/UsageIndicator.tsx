"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Users, 
  HardDrive, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface UsageIndicatorProps {
  planName: string;
  coursesUsed: number;
  coursesLimit: number | null;
  studentsEnrolled: number;
  studentsLimit: number | null;
  storageUsedGB: number;
  storageLimitGB: number | null;
}

export function UsageIndicator({
  planName,
  coursesUsed,
  coursesLimit,
  studentsEnrolled,
  studentsLimit,
  storageUsedGB,
  storageLimitGB,
}: UsageIndicatorProps) {
  const getPercentage = (used: number, limit: number | null): number => {
    if (limit === null) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getStatus = (used: number, limit: number | null): "ok" | "warning" | "critical" => {
    if (limit === null) return "ok"; // Unlimited
    const percentage = (used / limit) * 100;
    if (percentage >= 100) return "critical";
    if (percentage >= 80) return "warning";
    return "ok";
  };

  const formatStorage = (gb: number): string => {
    if (gb < 1) return `${(gb * 1024).toFixed(0)} MB`;
    return `${gb.toFixed(1)} GB`;
  };

  const coursesStatus = getStatus(coursesUsed, coursesLimit);
  const studentsStatus = getStatus(studentsEnrolled, studentsLimit);
  const storageStatus = getStatus(storageUsedGB, storageLimitGB);

  const coursesPercentage = getPercentage(coursesUsed, coursesLimit);
  const studentsPercentage = getPercentage(studentsEnrolled, studentsLimit);
  const storagePercentage = getPercentage(storageUsedGB, storageLimitGB);

  const hasAnyWarning = coursesStatus === "warning" || studentsStatus === "warning" || storageStatus === "warning";
  const hasAnyCritical = coursesStatus === "critical" || studentsStatus === "critical" || storageStatus === "critical";

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Usage Overview</CardTitle>
            <CardDescription className="text-sm mt-1">
              {planName} Plan
            </CardDescription>
          </div>
          {(hasAnyWarning || hasAnyCritical) && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={hasAnyCritical ? "text-red-500" : "text-yellow-500"}
            >
              {hasAnyCritical ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
            </motion.div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Courses Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Courses</span>
            </div>
            <span className={`font-semibold ${
              coursesStatus === "critical" ? "text-red-500" :
              coursesStatus === "warning" ? "text-yellow-500" :
              "text-emerald-500"
            }`}>
              {coursesUsed} / {coursesLimit === null ? "∞" : coursesLimit}
            </span>
          </div>
          {coursesLimit !== null && (
            <Progress 
              value={coursesPercentage} 
              className={`h-2 ${
                coursesStatus === "critical" ? "bg-red-500" :
                coursesStatus === "warning" ? "bg-yellow-500" :
                ""
              }`}
            />
          )}
          {coursesStatus === "warning" && coursesLimit !== null && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              ⚠️ You&apos;ve created {coursesUsed} of {coursesLimit} courses. Upgrade to publish more.
            </p>
          )}
          {coursesStatus === "critical" && coursesLimit !== null && (
            <p className="text-xs text-red-600 dark:text-red-400">
              🚫 Course limit reached. Upgrade to create more courses.
            </p>
          )}
        </div>

        {/* Students Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Students</span>
            </div>
            <span className={`font-semibold ${
              studentsStatus === "critical" ? "text-red-500" :
              studentsStatus === "warning" ? "text-yellow-500" :
              "text-emerald-500"
            }`}>
              {studentsEnrolled} / {studentsLimit === null ? "∞" : studentsLimit}
            </span>
          </div>
          {studentsLimit !== null && (
            <Progress 
              value={studentsPercentage} 
              className={`h-2 ${
                studentsStatus === "critical" ? "bg-red-500" :
                studentsStatus === "warning" ? "bg-yellow-500" :
                ""
              }`}
            />
          )}
          {studentsStatus === "warning" && studentsLimit !== null && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              📊 You&apos;re close to your student limit. Upgrade to enroll more learners.
            </p>
          )}
          {studentsStatus === "critical" && studentsLimit !== null && (
            <p className="text-xs text-red-600 dark:text-red-400">
              🚫 Student limit reached. Upgrade to continue enrolling students.
            </p>
          )}
        </div>

        {/* Storage Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Storage</span>
            </div>
            <span className={`font-semibold ${
              storageStatus === "critical" ? "text-red-500" :
              storageStatus === "warning" ? "text-yellow-500" :
              "text-emerald-500"
            }`}>
              {formatStorage(storageUsedGB)} / {storageLimitGB === null ? "∞" : formatStorage(storageLimitGB)}
            </span>
          </div>
          {storageLimitGB !== null && (
            <Progress 
              value={storagePercentage} 
              className={`h-2 ${
                storageStatus === "critical" ? "bg-red-500" :
                storageStatus === "warning" ? "bg-yellow-500" :
                ""
              }`}
            />
          )}
          {storageStatus === "warning" && storageLimitGB !== null && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              💾 Storage almost full ({formatStorage(storageUsedGB)} of {formatStorage(storageLimitGB)} used). Upgrade for more space.
            </p>
          )}
          {storageStatus === "critical" && storageLimitGB !== null && (
            <p className="text-xs text-red-600 dark:text-red-400">
              🚫 Storage limit reached. Upgrade to upload more videos and files.
            </p>
          )}
        </div>

        {/* Upgrade CTA */}
        {(hasAnyWarning || hasAnyCritical) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2 border-t"
          >
            <Link href="/pricing">
              <Button 
                variant={hasAnyCritical ? "default" : "outline"} 
                className="w-full"
                size="sm"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {hasAnyCritical ? "Upgrade Now" : "Upgrade to Grow"}
              </Button>
            </Link>
          </motion.div>
        )}

        {/* All Good Status */}
        {!hasAnyWarning && !hasAnyCritical && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 pt-2 border-t">
            <CheckCircle2 className="h-4 w-4" />
            <span>You&apos;re doing great! Keep growing your teaching business.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

