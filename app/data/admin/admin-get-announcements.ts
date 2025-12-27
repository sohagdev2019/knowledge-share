import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { auth } from "@/lib/auth";

export async function adminGetAnnouncements() {
  const session = await requireAdmin();
  const userRole = (session.user as any).role;
  const userId = session.user.id;

  // Superadmin sees all announcements
  // Admin sees only their own announcements
  const where = userRole === "superadmin" 
    ? {} 
    : { createdById: userId };

  const announcements = await prisma.announcement.findMany({
    where,
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
        },
      },
      targetCourse: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      _count: {
        select: {
          readStatuses: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return announcements;
}











