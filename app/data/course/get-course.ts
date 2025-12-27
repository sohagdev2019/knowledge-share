import "server-only";

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export async function getIndividualCourse(slug: string) {
  const course = await prisma.course.findUnique({
    where: {
      slug: slug,
    },
    select: {
      id: true,
      title: true,
      description: true,
      fileKey: true,
      price: true,
      duration: true,
      level: true,
      category: true,
      smallDescription: true,
      updatedAt: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
          designation: true,
          bio: true,
        },
      },
      chapter: {
        select: {
          id: true,
          title: true,
          lessons: {
            select: {
              id: true,
              title: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!course || !course.user) {
    return notFound();
  }

  // Calculate instructor statistics
  // First, get all course IDs for this instructor
  const instructorCourseIds = await prisma.course.findMany({
    where: {
      userId: course.user.id,
    },
    select: {
      id: true,
    },
  });

  const courseIds = instructorCourseIds.map((c) => c.id);

  const instructorCourses = courseIds.length;

  const totalStudents = await prisma.enrollment.count({
    where: {
      courseId: {
        in: courseIds,
      },
    },
  });

  const instructorRatings = await prisma.courseRating.findMany({
    where: {
      courseId: {
        in: courseIds,
      },
    },
    select: {
      rating: true,
    },
  });

  const averageRating =
    instructorRatings.length > 0
      ? instructorRatings.reduce((sum, r) => sum + r.rating, 0) /
        instructorRatings.length
      : 0;

  const totalReviews = instructorRatings.length;

  // Get course-specific statistics
  const courseEnrollmentCount = await prisma.enrollment.count({
    where: {
      courseId: course.id,
      status: "Active",
    },
  });

  const courseRatings = await prisma.courseRating.findMany({
    where: {
      courseId: course.id,
    },
    select: {
      rating: true,
    },
  });

  const courseAverageRating =
    courseRatings.length > 0
      ? courseRatings.reduce((sum, r) => sum + r.rating, 0) /
        courseRatings.length
      : 0;

  const courseReviewCount = courseRatings.length;

  return {
    ...course,
    courseStats: {
      enrolled: courseEnrollmentCount,
      averageRating: courseAverageRating,
      reviewCount: courseReviewCount,
    },
    instructorStats: {
      courses: instructorCourses,
      students: totalStudents,
      reviews: totalReviews,
      averageRating: averageRating,
    },
  };
}
