import "server-only";
import { prisma } from "@/lib/db";

export async function getBlogComments(blogId: string) {
  return prisma.blogComment.findMany({
    where: {
      blogId,
      parentId: null, // Only top-level comments
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
          username: true,
        },
      },
      replies: {
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              image: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}














