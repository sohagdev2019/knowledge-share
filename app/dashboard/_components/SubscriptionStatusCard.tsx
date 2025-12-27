"use client";

import { UserSubscriptionType } from "@/app/data/subscription/get-user-subscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CreditCard, ArrowRight, CheckCircle2, Clock } from "lucide-react";

interface SubscriptionStatusCardProps {
  subscription: UserSubscriptionType;
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "Active":
      return "default";
    case "Trial":
      return "secondary";
    case "Cancelled":
      return "destructive";
    case "Expired":
      return "outline";
    case "PastDue":
      return "destructive";
    default:
      return "outline";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "Active":
      return CheckCircle2;
    case "Trial":
      return Clock;
    default:
      return CreditCard;
  }
}

export function SubscriptionStatusCard({ subscription }: SubscriptionStatusCardProps) {
  if (!subscription) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Subscription</CardTitle>
              <CardDescription>No active subscription</CardDescription>
            </div>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Upgrade to unlock premium features
            </p>
            <Link href="/pricing">
              <Button size="sm" variant="outline">
                View Plans
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { plan, status, billingCycle, nextBillingDate } = subscription;
  const StatusIcon = getStatusIcon(status);
  const isActive = status === "Active" || status === "Trial";

  return (
    <Card className={isActive ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/10" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <StatusIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              {plan.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {billingCycle === "Yearly" ? "Annual" : "Monthly"} Plan
            </CardDescription>
          </div>
          <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next billing</span>
            <span className="font-medium">
              {nextBillingDate
                ? new Date(nextBillingDate).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              ${((billingCycle === "Yearly" ? plan.priceYearly : plan.priceMonthly) / 100).toFixed(2)}/{billingCycle === "Yearly" ? "year" : "month"}
            </span>
            <Link href="/dashboard/subscription">
              <Button size="sm" variant="outline">
                Manage
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

