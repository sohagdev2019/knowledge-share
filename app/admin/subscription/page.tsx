import { getAdminSubscription } from "@/app/data/admin/get-admin-subscription";
import { AdminSubscriptionDashboard } from "./_components/AdminSubscriptionDashboard";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subscription Management | Edupeak",
  description: "Manage your teacher subscription plan, billing, and invoices",
};

export default async function AdminSubscriptionPage() {
  await requireAdmin();
  const { subscription, subscriptionHistory, invoices } = await getAdminSubscription();

  return (
    <AdminSubscriptionDashboard 
      subscription={subscription} 
      subscriptionHistory={subscriptionHistory}
      invoices={invoices} 
    />
  );
}

