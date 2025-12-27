import { getAdminSubscription } from "@/app/data/admin/get-admin-subscription";
import { SubscriptionDetails } from "./SubscriptionDetails";

export async function SubscriptionDetailsServer() {
  const { subscription, invoices } = await getAdminSubscription();

  // Only pass serializable data (no functions or event handlers)
  return (
    <SubscriptionDetails 
      subscription={subscription ? {
        id: subscription.id,
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        nextBillingDate: subscription.nextBillingDate,
        autoRenew: subscription.autoRenew,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        plan: {
          id: subscription.plan.id,
          name: subscription.plan.name,
          description: subscription.plan.description,
          priceMonthly: subscription.plan.priceMonthly,
          priceYearly: subscription.plan.priceYearly,
          features: subscription.plan.features,
        },
      } : null}
      invoices={invoices.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        planName: invoice.planName,
        amount: invoice.amount,
        totalAmount: invoice.totalAmount,
        paymentStatus: invoice.paymentStatus,
        paymentDate: invoice.paymentDate,
        createdAt: invoice.createdAt,
        stripeInvoiceId: invoice.stripeInvoiceId,
        pdfUrl: invoice.pdfUrl,
      }))}
    />
  );
}

