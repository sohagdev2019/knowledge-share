import { getSubscriptionPlanBySlug } from "@/app/data/subscription/get-subscription-plan-by-slug";
import { redirect } from "next/navigation";
import { CheckoutForm } from "./_components/CheckoutForm";
import { getUserSubscription } from "@/app/data/subscription/get-user-subscription";

type SearchParams = Promise<{
  plan?: string;
  billing?: string;
}>;

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const planSlug = params.plan;
  const billingCycle = params.billing || "monthly";

  if (!planSlug) {
    redirect("/pricing");
  }

  const [plan, currentSubscription] = await Promise.all([
    getSubscriptionPlanBySlug(planSlug),
    getUserSubscription(),
  ]);

  // If user already has an active subscription to this plan, redirect
  if (currentSubscription?.planId === plan.id && currentSubscription.status === "Active") {
    redirect("/dashboard/subscription");
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Complete Your Purchase</h1>
          <p className="text-muted-foreground">You're just one step away from unlocking premium features</p>
        </div>
        <CheckoutForm plan={plan} billingCycle={billingCycle as "monthly" | "yearly"} />
      </div>
    </div>
  );
}

