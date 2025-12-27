import { getSubscriptionPlans } from "@/app/data/subscription/get-subscription-plans";
import { getUserSubscription } from "@/app/data/subscription/get-user-subscription";
import { getUserRole } from "@/lib/role-access";
import { auth } from "@/lib/auth";
import { PricingPlans } from "./_components/PricingPlans";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  // Get user role and session
  const session = await auth();
  const userRole = await getUserRole();
  const isLoggedIn = !!session?.user;

  const [plans, subscriptionData] = await Promise.all([
    getSubscriptionPlans(),
    getUserSubscription(),
  ]);

  return (
    <PricingPlans 
      plans={plans} 
      currentSubscription={subscriptionData.subscription}
      userRole={userRole}
      isLoggedIn={isLoggedIn}
    />
  );
}
