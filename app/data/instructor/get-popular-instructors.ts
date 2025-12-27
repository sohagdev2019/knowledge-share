import "server-only";

import { prisma } from "@/lib/db";

export async function getPopularInstructors() {
  // Get all instructors who have published courses
  const instructors = await prisma.user.findMany({
    where: {
      courses: {
        some: {
          status: "Published",
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      image: true,
      designation: true,
      bio: true,
      courses: {
        where: {
          status: "Published",
        },
        select: {
          id: true,
          category: true,
          ratings: {
            select: {
              rating: true,
            },
          },
          enrollment: {
            where: {
              status: "Active",
            },
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  // Calculate stats for each instructor
  const instructorsWithStats = instructors
    .map((instructor) => {
      const courseCount = instructor.courses.length;
      const totalEnrollments = instructor.courses.reduce(
        (sum, course) => sum + course.enrollment.length,
        0
      );

      // Calculate average rating across all courses
      const allRatings = instructor.courses.flatMap(
        (course) => course.ratings
      );
      const averageRating =
        allRatings.length > 0
          ? allRatings.reduce((sum, r) => sum + r.rating, 0) /
            allRatings.length
          : 0;

      // Get unique categories (expertise areas)
      const categories = [
        ...new Set(instructor.courses.map((course) => course.category)),
      ].slice(0, 2); // Limit to 2 categories

      return {
        id: instructor.id,
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        image: instructor.image,
        designation: instructor.designation,
        bio: instructor.bio,
        courseCount,
        totalEnrollments,
        averageRating: Math.round(averageRating * 10) / 10,
        expertise: categories,
      };
    })
    .filter((instructor) => instructor.courseCount > 0) // Only show instructors with courses
    .sort((a, b) => b.totalEnrollments - a.totalEnrollments) // Sort by enrollment count
    .slice(0, 12); // Limit to top 12

  return instructorsWithStats;
}

export type PopularInstructorType = Awaited<
  ReturnType<typeof getPopularInstructors>
>[0];

