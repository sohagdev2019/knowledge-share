import "server-only";
import { prisma } from "@/lib/db";

export async function getBlogCategories() {
  return prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          blogs: {
            where: {
              status: "Approved",
              isDraft: false,
            },
          },
        },
      },
    },
  });
}














