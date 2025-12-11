import "server-only";
import { requireUser } from "./require-user";
import { prisma } from "@/lib/db";

export async function getWishlist() {
  const user = await requireUser();

  const wishlistItems = await prisma.wishlist.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      createdAt: true,
      course: {
        select: {
          id: true,
          title: true,
          fileKey: true,
          price: true,
          category: true,
          slug: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              username: true,
            },
          },
          ratings: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              ratings: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform the data to include calculated fields
  const data = wishlistItems.map((item) => {
    const ratings = item.course.ratings;
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;
    const reviewCount = item.course._count.ratings;

    const instructorName =
      item.course.user.username ||
      `${item.course.user.firstName} ${item.course.user.lastName || ""}`.trim() ||
      "Unknown Instructor";

    return {
      id: item.id,
      courseId: item.course.id,
      title: item.course.title,
      fileKey: item.course.fileKey,
      price: item.course.price,
      category: item.course.category,
      slug: item.course.slug,
      instructor: instructorName,
      rating: averageRating,
      reviews: reviewCount,
      createdAt: item.createdAt,
    };
  });

  return data;
}

export type WishlistItemType = Awaited<ReturnType<typeof getWishlist>>[0];

