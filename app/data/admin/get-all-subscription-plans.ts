import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function getAllSubscriptionPlans() {
  await requireAdmin();

  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: [
      { isPopular: "desc" },
      { priceMonthly: "asc" },
    ],
  });

  return plans;
}

export type AdminSubscriptionPlanType = Awaited<
  ReturnType<typeof getAllSubscriptionPlans>
>[0];

