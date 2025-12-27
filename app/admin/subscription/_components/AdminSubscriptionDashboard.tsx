"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Calendar, CreditCard, Download, RefreshCw, X, Check, FileText, Receipt, History, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cancelAdminSubscription, upgradeAdminSubscription } from "../actions";
import { CancelSubscriptionDialog } from "./CancelSubscriptionDialog";
import { useState } from "react";

interface AdminSubscriptionDashboardProps {
  subscription: {
    id: string;
    status: string;
    billingCycle: string;
    startDate: Date;
    endDate: Date | null;
    nextBillingDate: Date | null;
    autoRenew: boolean;
    stripeSubscriptionId: string | null;
    cancelledAt: Date | null;
    plan: {
      id: string;
      name: string;
      description: string | null;
      priceMonthly: number | null;
      priceYearly: number | null;
      features: any;
    };
  } | null;
  subscriptionHistory: Array<{
    id: string;
    action: string;
    createdAt: Date;
    metadata: any;
    oldPlan: {
      id: string;
      name: string;
    } | null;
    newPlan: {
      id: string;
      name: string;
    } | null;
    subscription: {
      id: string;
      plan: {
        id: string;
        name: string;
      };
    } | null;
  }>;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    planName: string;
    amount: number;
    totalAmount: number;
    paymentStatus: string;
    paymentDate: Date | null;
    createdAt: Date;
    stripeInvoiceId: string | null;
  }>;
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

const formatPrice = (cents: number | null | undefined): string => {
  if (cents === null || cents === undefined) return "$0.00";
  return `$${(cents / 100).toFixed(2)}`;
};

const formatDate = (date: Date | null) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function AdminSubscriptionDashboard({ 
  subscription, 
  subscriptionHistory,
  invoices 
}: AdminSubscriptionDashboardProps) {
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { plan, status, billingCycle, nextBillingDate, endDate, startDate, autoRenew, cancelledAt } = subscription || {};
  const isCancelled = status === "Cancelled";
  const daysRemaining = endDate ? Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
  const price = plan ? (billingCycle === "Yearly" ? plan.priceYearly : plan.priceMonthly) : null;

  const handleCancel = async (reason: string) => {
    try {
      const result = await cancelAdminSubscription(reason);
      if (result.status === "success") {
        toast.success(result.message || "Subscription cancelled successfully");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to cancel subscription");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  // Get cancellation reason from history
  const cancellationHistory = subscriptionHistory.find(
    (h) => h.action === "Cancelled" && h.subscription?.id === subscription?.id
  );
  const cancellationReason = cancellationHistory?.metadata?.cancellationReason;

  // Group invoices by month
  const groupedInvoices = invoices.reduce((acc, invoice) => {
    const dateToUse = invoice.paymentDate || invoice.createdAt;
    const monthKey = new Date(dateToUse).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(invoice);
    return acc;
  }, {} as Record<string, typeof invoices>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground">Manage your teacher subscription plan, billing, and invoices</p>
      </div>

      {!subscription ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You don't have an active subscription
              </p>
              <Link href="/pricing">
                <Button>Browse Teacher Plans</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current/Cancelled Subscription Card */}
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
                  ? formatDate(endDate)
                  : nextBillingDate
                  ? formatDate(nextBillingDate)
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

          {/* Pricing */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Price</span>
              </div>
              <span className="text-2xl font-bold">
                {price ? formatPrice(price) : "N/A"}
              </span>
            </div>
          </div>

          {/* Auto Renew */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Auto Renew</span>
              </div>
              {autoRenew ? (
                <Badge variant="outline" className="border-green-500 text-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              ) : (
                <Badge variant="outline" className="border-red-500 text-red-500">
                  <X className="h-3 w-3 mr-1" />
                  Disabled
                </Badge>
              )}
            </div>
          </div>

          {/* Cancellation Reason (if cancelled) */}
          {isCancelled && cancellationReason && (
            <div className="border-t pt-4">
              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Cancellation Reason</p>
                  <p className="text-sm">{cancellationReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t pt-4 flex gap-2">
            {!isCancelled && (
              <Button 
                variant="destructive" 
                onClick={() => setShowCancelDialog(true)} 
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Subscription
              </Button>
            )}
            <Link href="/pricing" className="flex-1">
              <Button variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                {isCancelled ? "Resubscribe" : "Change Plan"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Subscription Dialog */}
      {plan && (
        <CancelSubscriptionDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          onConfirm={handleCancel}
          planName={plan.name}
        />
      )}

      {/* Subscription History Card */}
      {subscriptionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Subscription History</CardTitle>
                <CardDescription>Your subscription activity and changes</CardDescription>
              </div>
              <History className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscriptionHistory.map((historyItem) => {
                const planName = historyItem.newPlan?.name || historyItem.oldPlan?.name || historyItem.subscription?.plan.name || "Unknown Plan";
                const actionColor = historyItem.action === "Cancelled" ? "text-red-500" : 
                                  historyItem.action === "Created" ? "text-green-500" :
                                  historyItem.action === "Upgraded" ? "text-blue-500" : "text-muted-foreground";
                
                return (
                  <div
                    key={historyItem.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-2 bg-muted rounded shrink-0">
                      <History className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-medium ${actionColor}`}>
                          {historyItem.action}
                        </p>
                        {historyItem.action === "Cancelled" && (
                          <Badge variant="outline" className="border-red-500 text-red-500 text-xs">
                            Cancelled
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {planName}
                      </p>
                      {historyItem.oldPlan && historyItem.newPlan && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {historyItem.oldPlan.name} → {historyItem.newPlan.name}
                        </p>
                      )}
                      {historyItem.metadata?.cancellationReason && (
                        <p className="text-sm text-muted-foreground mt-1 italic">
                          Reason: {historyItem.metadata.cancellationReason}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(historyItem.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      </>
      )}

      {/* Invoices Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Your billing history</CardDescription>
            </div>
            <Receipt className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No invoices found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedInvoices).map(([month, monthInvoices]) => (
                <div key={month} className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {month}
                  </h3>
                  <div className="space-y-2">
                    {monthInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-muted rounded">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{invoice.planName}</p>
                            <p className="text-sm text-muted-foreground">
                              {invoice.invoiceNumber} • {formatDate(invoice.paymentDate || invoice.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatPrice(invoice.totalAmount)}</p>
                            {invoice.paymentStatus === "Paid" ? (
                              <Badge variant="outline" className="border-green-500 text-green-500 mt-1">
                                Paid
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-500 mt-1">
                                {invoice.paymentStatus}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              window.open(`/api/invoices/${invoice.id}/download`, '_blank');
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

