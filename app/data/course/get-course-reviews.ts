import "server-only";

import { prisma } from "@/lib/db";

export async function getCourseReviews(courseId: string) {
  const ratings = await prisma.courseRating.findMany({
    where: {
      courseId: courseId,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate rating distribution
  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  ratings.forEach((rating) => {
    distribution[rating.rating as keyof typeof distribution]++;
  });

  const totalRatings = ratings.length;
  const distributionPercentages = {
    5: totalRatings > 0 ? (distribution[5] / totalRatings) * 100 : 0,
    4: totalRatings > 0 ? (distribution[4] / totalRatings) * 100 : 0,
    3: totalRatings > 0 ? (distribution[3] / totalRatings) * 100 : 0,
    2: totalRatings > 0 ? (distribution[2] / totalRatings) * 100 : 0,
    1: totalRatings > 0 ? (distribution[1] / totalRatings) * 100 : 0,
  };

  const averageRating =
    totalRatings > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

  return {
    ratings,
    averageRating,
    totalRatings,
    distribution,
    distributionPercentages,
  };
}

