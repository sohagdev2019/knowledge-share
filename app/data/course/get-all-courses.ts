import "server-only";

import { prisma } from "@/lib/db";

export async function getAllCourses() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
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
      _count: {
        select: {
          enrollment: {
            where: {
              status: "Active",
            },
          },
          chapter: true,
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
    };
  });

  return data;
}

export type PublicCourseType = Awaited<ReturnType<typeof getAllCourses>>[0];
