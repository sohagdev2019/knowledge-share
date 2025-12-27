"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  CreditCard, 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock,
  DollarSign,
  Receipt
} from "lucide-react";
import Link from "next/link";

// Helper function to format price
const formatPrice = (cents: number | null | undefined): string => {
  if (cents === null || cents === undefined) return "$0.00";
  return `$${(cents / 100).toFixed(2)}`;
};

interface SubscriptionDetailsProps {
  subscription: {
    id: string;
    status: string;
    billingCycle: string;
    startDate: Date;
    endDate: Date | null;
    nextBillingDate: Date | null;
    autoRenew: boolean;
    stripeSubscriptionId: string | null;
    plan: {
      id: string;
      name: string;
      description: string | null;
      priceMonthly: number | null;
      priceYearly: number | null;
      features: any;
    };
  } | null;
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
    pdfUrl: string | null;
  }>;
}

export function SubscriptionDetails({ subscription, invoices }: SubscriptionDetailsProps) {
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>No active subscription found</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/pricing">
            <Button>View Plans</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const plan = subscription.plan;
  const price = subscription.billingCycle === "Yearly" 
    ? plan.priceYearly 
    : plan.priceMonthly;

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "Trial":
        return <Badge className="bg-blue-500">Trial</Badge>;
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Group invoices by month
  const groupedInvoices = invoices.reduce((acc, invoice) => {
    // Use paymentDate if available, otherwise use createdAt
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
      {/* Current Subscription Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </div>
            {getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plan Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plan Name</p>
              <p className="text-lg font-semibold">{plan.name}</p>
              {plan.description && (
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Billing Cycle</p>
              <p className="text-lg font-semibold">{subscription.billingCycle}</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Price</span>
              </div>
              <span className="text-2xl font-bold">
                {price ? formatPrice(price) : "N/A"}
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Start Date</p>
              </div>
              <p className="text-sm font-semibold">{formatDate(subscription.startDate)}</p>
            </div>
            {subscription.endDate && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">End Date</p>
                </div>
                <p className="text-sm font-semibold">{formatDate(subscription.endDate)}</p>
              </div>
            )}
            {subscription.nextBillingDate && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">Next Billing</p>
                </div>
                <p className="text-sm font-semibold">{formatDate(subscription.nextBillingDate)}</p>
              </div>
            )}
          </div>

          {/* Auto Renew */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Auto Renew</span>
              </div>
              {subscription.autoRenew ? (
                <Badge variant="outline" className="border-green-500 text-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              ) : (
                <Badge variant="outline" className="border-red-500 text-red-500">
                  Disabled
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-4 flex gap-2">
            <Link href="/admin/subscription" className="flex-1">
              <Button variant="outline" className="w-full">
                Manage Subscription
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

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

