import { requireUser } from "@/app/data/user/require-user";
import { getUserSubscription } from "@/app/data/subscription/get-user-subscription";
import { CancelSubscriptionForm } from "./_components/CancelSubscriptionForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CancelSubscriptionPage() {
  await requireUser();
  const { subscription } = await getUserSubscription();

  if (!subscription || subscription.status !== "Active") {
    redirect("/dashboard/subscription");
  }

  return <CancelSubscriptionForm subscription={subscription} />;
}

