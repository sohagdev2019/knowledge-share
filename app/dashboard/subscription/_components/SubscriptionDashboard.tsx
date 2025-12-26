"use client";

import { UserSubscriptionType } from "@/app/data/subscription/get-user-subscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Calendar, CreditCard, Download, RefreshCw, X, Check } from "lucide-react";

interface SubscriptionDashboardProps {
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

export function SubscriptionDashboard({ subscription }: SubscriptionDashboardProps) {
  if (!subscription) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription plan</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You don't have an active subscription
              </p>
              <Link href="/pricing">
                <Button>Browse Plans</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { plan, status, billingCycle, nextBillingDate, endDate, startDate } = subscription;
  const isCancelled = status === "Cancelled";
  const daysRemaining = endDate ? Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription plan</p>
      </div>

      {/* Current Subscription Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description || "Your current subscription plan"}</CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Info */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Billing Cycle</p>
              <p className="font-semibold capitalize">{billingCycle}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {isCancelled ? "Access Until" : "Next Billing Date"}
              </p>
              <p className="font-semibold">
                {isCancelled && endDate
                  ? new Date(endDate).toLocaleDateString()
                  : nextBillingDate
                  ? new Date(nextBillingDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            {daysRemaining !== null && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {isCancelled ? "Days Remaining" : "Renews In"}
                </p>
                <p className="font-semibold">{daysRemaining} days</p>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {billingCycle === "Yearly" ? "Annual" : "Monthly"} Price
              </span>
              <span className="text-2xl font-bold">
                $
                {(
                  (billingCycle === "Yearly" ? plan.priceYearly : plan.priceMonthly) /
                  100
                ).toFixed(2)}
              </span>
            </div>
            {billingCycle === "Yearly" && (
              <p className="text-sm text-muted-foreground mt-1">
                ${(plan.priceYearly / 12 / 100).toFixed(2)}/month billed annually
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="border-t pt-4 flex flex-wrap gap-3">
            {!isCancelled && (
              <>
                <Link href="/pricing">
                  <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Change Plan
                  </Button>
                </Link>
                <Link href="/dashboard/subscription/cancel">
                  <Button variant="outline" className="text-destructive hover:text-destructive">
                    <X className="mr-2 h-4 w-4" />
                    Cancel Subscription
                  </Button>
                </Link>
              </>
            )}
            {isCancelled && (
              <Link href="/dashboard/subscription/resume">
                <Button>
                  <Check className="mr-2 h-4 w-4" />
                  Resume Subscription
                </Button>
              </Link>
            )}
            <Link href="/dashboard/subscription/invoices">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                View Invoices
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
          <CardDescription>What's included in your plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="font-semibold">Course Access</p>
              <p className="text-sm text-muted-foreground">
                {plan.maxCourseAccess === null
                  ? "Unlimited courses"
                  : `Up to ${plan.maxCourseAccess} courses`}
              </p>
            </div>
            {plan.allowsDownloads && (
              <div className="space-y-2">
                <p className="font-semibold">Downloads</p>
                <p className="text-sm text-muted-foreground">Downloadable resources enabled</p>
              </div>
            )}
            {plan.allowsCertificates && (
              <div className="space-y-2">
                <p className="font-semibold">Certificates</p>
                <p className="text-sm text-muted-foreground">Downloadable certificates</p>
              </div>
            )}
            {plan.allowsLiveClasses && (
              <div className="space-y-2">
                <p className="font-semibold">Live Classes</p>
                <p className="text-sm text-muted-foreground">Access to live Q&A sessions</p>
              </div>
            )}
            {plan.allowsTeamAccess && (
              <div className="space-y-2">
                <p className="font-semibold">Team Access</p>
                <p className="text-sm text-muted-foreground">
                  Up to {plan.teamSeats} team members
                </p>
              </div>
            )}
            {plan.prioritySupport && (
              <div className="space-y-2">
                <p className="font-semibold">Support</p>
                <p className="text-sm text-muted-foreground">Priority customer support</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

