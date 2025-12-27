import { getSubscriptionPlan } from "@/app/data/admin/get-subscription-plan";
import { SubscriptionPlanForm } from "../../_components/SubscriptionPlanForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

type Params = Promise<{ planId: string }>;

export default async function EditSubscriptionPlanPage({
  params,
}: {
  params: Params;
}) {
  const { planId } = await params;
  const plan = await getSubscriptionPlan(planId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/superadmin/subscription-plans"
          className={buttonVariants({ variant: "outline", size: "icon" })}
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-3xl font-bold">
          Edit Plan: <span className="text-primary">{plan.name}</span>
        </h1>
      </div>

      <SubscriptionPlanForm plan={plan} />
    </div>
  );
}

