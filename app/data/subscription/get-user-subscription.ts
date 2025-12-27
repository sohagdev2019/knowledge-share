import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getUserSubscription() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      subscription: null,
      subscriptionHistory: [],
    };
  }

  // Get the most recent subscription (including cancelled ones to show history)
  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get all subscription history for this user
  const subscriptionHistory = await prisma.subscriptionHistory.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
      oldPlan: true,
      newPlan: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    subscription,
    subscriptionHistory,
  };
}

export type UserSubscriptionType = Awaited<
  ReturnType<typeof getUserSubscription>
>["subscription"];

export type UserSubscriptionHistoryType = Awaited<
  ReturnType<typeof getUserSubscription>
>["subscriptionHistory"];

