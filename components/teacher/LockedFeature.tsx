"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, TrendingUp } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LockedFeatureProps {
  featureName: string;
  requiredPlan: string;
  description?: string;
  children?: React.ReactNode;
}

export function LockedFeature({
  featureName,
  requiredPlan,
  description,
  children,
}: LockedFeatureProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          <Card className="opacity-60 cursor-not-allowed border-dashed">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {featureName}
                </span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                  Upgrade
                </span>
              </div>
              {description && (
                <p className="text-xs text-center text-muted-foreground">
                  {description}
                </p>
              )}
              {children && (
                <div className="mt-4 pointer-events-none">
                  {children}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-sm">
          This feature is available on {requiredPlan} and above.
        </p>
        <Link href="/pricing" className="block mt-2">
          <Button size="sm" variant="outline" className="w-full">
            <TrendingUp className="h-3 w-3 mr-2" />
            Upgrade Plan
          </Button>
        </Link>
      </TooltipContent>
    </Tooltip>
  );
}

