import "server-only";

import { prisma } from "@/lib/db";

export async function getAllInstructors() {
  // Get all users with admin role
  const instructors = await prisma.user.findMany({
    where: {
      AND: [
        { role: "admin" },
        {
          // Show users where banned is false, null, or not set (exclude only when banned is true)
          OR: [
            { banned: false },
            { banned: null },
          ],
        },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
      bio: true,
      designation: true,
      socialLinkedin: true,
      socialGithub: true,
      socialTwitter: true,
      socialWebsite: true,
      createdAt: true,
      role: true,
      courses: {
        where: {
          status: "Published",
        },
        select: {
          id: true,
          title: true,
          slug: true,
          _count: {
            select: {
              enrollment: {
                where: {
                  status: "Active",
                },
              },
            },
          },
        },
      },
      courseRatings: {
        select: {
          rating: true,
        },
      },
    },
  });

  // Calculate instructor metrics
  const instructorsWithMetrics = instructors
    .map((instructor) => {
      const coursesCount = instructor.courses.length;
      const totalEnrollments = instructor.courses.reduce(
        (sum, course) => sum + course._count.enrollment,
        0
      );
      const averageRating =
        instructor.courseRatings.length > 0
          ? instructor.courseRatings.reduce(
              (sum, rating) => sum + rating.rating,
              0
            ) / instructor.courseRatings.length
          : 0;

      return {
        ...instructor,
        coursesCount,
        totalEnrollments,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      };
    })
    // All fetched users are admins, no need to filter
    .sort((a, b) => {
      // Sort by total enrollments first, then by courses count
      if (b.totalEnrollments !== a.totalEnrollments) {
        return b.totalEnrollments - a.totalEnrollments;
      }
      return b.coursesCount - a.coursesCount;
    });

  return instructorsWithMetrics;
}

export type InstructorType = Awaited<ReturnType<typeof getAllInstructors>>[0];
