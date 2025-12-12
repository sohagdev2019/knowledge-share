import "server-only";

import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { prisma } from "@/lib/db";

export async function getHelpRequests(status?: string) {
  await requireSuperAdmin();
  
  const where: any = {};
  
  if (status && status !== "all") {
    where.status = status;
  }

  const helpRequests = await prisma.helpRequest.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return helpRequests;
}


