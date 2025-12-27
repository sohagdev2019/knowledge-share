import "server-only";
import { requireAdmin } from "./require-admin";
import { prisma } from "@/lib/db";

export async function getAdminSubscription() {
  const session = await requireAdmin();

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

  // Get all invoices for this user, ordered by date (newest first)
  const invoices = await prisma.invoice.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
    },
    orderBy: {
      paymentDate: "desc",
    },
  });

  return {
    subscription,
    subscriptionHistory,
    invoices,
  };
}

