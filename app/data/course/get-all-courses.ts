import "server-only";

import { prisma } from "@/lib/db";

export async function getAllCourses() {
  const courses = await prisma.course.findMany({
    where: {
      status: "Published",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      title: true,
      price: true,
      smallDescription: true,
      slug: true,
      fileKey: true,
      id: true,
      level: true,
      duration: true,
      category: true,
      createdAt: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      ratings: {
        select: {
          rating: true,
        },
      },
      _count: {
        select: {
          enrollment: {
            where: {
              status: "Active",
            },
          },
          chapter: true,
          ratings: true,
        },
      },
      chapter: {
        select: {
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },
    },
  });

  // Transform to include calculated stats
  const data = courses.map((course) => {
    const totalLessons = course.chapter.reduce(
      (sum, chapter) => sum + chapter._count.lessons,
      0
    );

    // Calculate average rating
    const ratings = course.ratings.map((r) => r.rating);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

    // Get instructor name
    const instructorName = course.user.lastName
      ? `${course.user.firstName} ${course.user.lastName}`
      : course.user.firstName;

    return {
      id: course.id,
      title: course.title,
      price: course.price,
      smallDescription: course.smallDescription,
      slug: course.slug,
      fileKey: course.fileKey,
      level: course.level,
      duration: course.duration,
      category: course.category,
      createdAt: course.createdAt,
      enrollmentCount: course._count.enrollment,
      chapterCount: course._count.chapter,
      lessonCount: totalLessons,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviewCount: course._count.ratings,
      instructorName,
    };
  });

  return data;
}

export type PublicCourseType = Awaited<ReturnType<typeof getAllCourses>>[0];
