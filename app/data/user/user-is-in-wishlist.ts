import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function checkIfCourseInWishlist(
  courseId: string
): Promise<boolean> {
  const session = await auth();

  if (!session?.user?.id) return false;

  const wishlist = await prisma.wishlist.findUnique({
    where: {
      userId_courseId: {
        courseId: courseId,
        userId: session.user.id,
      },
    },
  });

  return !!wishlist;
}

