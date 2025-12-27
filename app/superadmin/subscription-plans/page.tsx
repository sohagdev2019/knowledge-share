import { getAllSubscriptionPlans } from "@/app/data/admin/get-all-subscription-plans";
import { SubscriptionPlansTable } from "./_components/SubscriptionPlansTable";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubscriptionPlansPage() {
  const plans = await getAllSubscriptionPlans();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Manage subscription plans and pricing
          </p>
        </div>
        <Link href="/superadmin/subscription-plans/create" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Link>
      </div>

      <SubscriptionPlansTable plans={plans} />
    </div>
  );
}

