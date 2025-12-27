import "server-only";

import { prisma } from "@/lib/db";
import { PublicCourseType } from "./get-all-courses";

export async function getRelatedCourses(
  currentCourseId: string,
  category: string,
  limit: number = 4
): Promise<PublicCourseType[]> {
  const courses = await prisma.course.findMany({
    where: {
      status: "Published",
      category: category,
      id: {
        not: currentCourseId,
      },
    },
    take: limit,
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
      chapter: {
        select: {
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },
      _count: {
        select: {
          enrollment: {
            where: {
              status: "Active",
            },
          },
          ratings: true,
        },
      },
    },
  });

  return courses.map((course) => {
    const ratings = course.ratings.map((r) => r.rating);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;

    const instructorName = course.user.lastName
      ? `${course.user.firstName} ${course.user.lastName}`
      : course.user.firstName;

    const totalLessons = course.chapter.reduce(
      (sum, chapter) => sum + chapter._count.lessons,
      0
    );

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
      instructorName,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: course._count.ratings,
      enrollmentCount: course._count.enrollment,
      chapterCount: course.chapter.length,
      lessonCount: totalLessons,
    };
  });
}
