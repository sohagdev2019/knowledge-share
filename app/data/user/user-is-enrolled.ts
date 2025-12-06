import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function checkIfCourseBought(courseId: string): Promise<boolean> {
  const session = await auth();

  if (!session?.user?.id) return false;

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        courseId: courseId,
        userId: session.user.id,
      },
    },
    select: {
      status: true,
    },
  });

  return enrollment?.status === "Active" ? true : false;
}
