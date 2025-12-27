import "server-only";

import { prisma } from "@/lib/db";

export async function getSubscriptionPlans() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      { isPopular: "desc" },
      { priceMonthly: "asc" },
    ],
  });

  return plans;
}

export type SubscriptionPlanType = Awaited<
  ReturnType<typeof getSubscriptionPlans>
>[0];

