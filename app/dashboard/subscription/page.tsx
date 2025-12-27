import { getUserSubscription } from "@/app/data/subscription/get-user-subscription";
import { SubscriptionDashboard } from "./_components/SubscriptionDashboard";
import { requireUser } from "@/app/data/user/require-user";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subscription Management | Edupeak",
  description: "Manage your subscription plan, billing, and invoices",
};

export default async function SubscriptionPage() {
  await requireUser();
  const { subscription, subscriptionHistory } = await getUserSubscription();

  return (
    <SubscriptionDashboard 
      subscription={subscription} 
      subscriptionHistory={subscriptionHistory}
    />
  );
}

