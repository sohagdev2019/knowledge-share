import { SubscriptionPlanForm } from "../_components/SubscriptionPlanForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function CreateSubscriptionPlanPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/superadmin/subscription-plans"
          className={buttonVariants({ variant: "outline", size: "icon" })}
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-3xl font-bold">Create Subscription Plan</h1>
      </div>

      <SubscriptionPlanForm />
    </div>
  );
}

