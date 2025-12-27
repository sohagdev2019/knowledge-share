import { getSubscriptionPlanBySlug } from "@/app/data/subscription/get-subscription-plan-by-slug";
import { getUserRole, getRoleBasedRedirect } from "@/lib/role-access";
import { isAdminPlan } from "@/lib/plan-utils";
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

  const [plan, subscriptionData, userRole] = await Promise.all([
    getSubscriptionPlanBySlug(planSlug),
    getUserSubscription(),
    getUserRole(),
  ]);

  if (!plan) {
    redirect("/pricing");
  }

  const currentSubscription = subscriptionData.subscription;

  // Check if user can subscribe to this plan type
  const planIsTeacherPlan = isAdminPlan(plan);
  
  // SuperAdmin: redirect away (they don't need subscriptions)
  if (userRole === "superadmin") {
    const redirectUrl = await getRoleBasedRedirect();
    redirect(redirectUrl);
  }

  // Admin: only allow teacher plans
  if (userRole === "admin" && !planIsTeacherPlan) {
    redirect("/admin");
  }

  // User: only allow student plans
  if (userRole === "user" && planIsTeacherPlan) {
    redirect("/pricing");
  }

  // If user already has an active subscription to this plan, redirect (role-aware)
  if (currentSubscription?.planId === plan.id && currentSubscription.status === "Active") {
    const subscriptionPath = userRole === "admin" ? "/admin/subscription" : "/dashboard/subscription";
    redirect(subscriptionPath);
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

