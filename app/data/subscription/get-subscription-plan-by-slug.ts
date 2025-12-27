import "server-only";

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export async function getSubscriptionPlanBySlug(slug: string) {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: {
      slug: slug,
      isActive: true,
    },
  });

  if (!plan) {
    return notFound();
  }

  return plan;
}

