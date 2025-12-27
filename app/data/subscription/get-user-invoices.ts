import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getUserInvoices() {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
    },
  });

  return invoices;
}

export type UserInvoiceType = Awaited<
  ReturnType<typeof getUserInvoices>
>[0];

