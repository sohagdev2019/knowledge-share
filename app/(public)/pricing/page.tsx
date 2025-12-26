import { getSubscriptionPlans } from "@/app/data/subscription/get-subscription-plans";
import { getUserSubscription } from "@/app/data/subscription/get-user-subscription";
import { PricingPlans } from "./_components/PricingPlans";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const [plans, currentSubscription] = await Promise.all([
    getSubscriptionPlans(),
    getUserSubscription(),
  ]);

  return <PricingPlans plans={plans} currentSubscription={currentSubscription} />;
}
