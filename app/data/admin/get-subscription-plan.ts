import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { notFound } from "next/navigation";

export async function getSubscriptionPlan(id: string) {
  await requireAdmin();

  const plan = await prisma.subscriptionPlan.findUnique({
    where: {
      id: id,
    },
  });

  if (!plan) {
    return notFound();
  }

  return plan;
}

export type SubscriptionPlanDetailType = Awaited<
  ReturnType<typeof getSubscriptionPlan>
>;

