import "server-only";
import { requireUser } from "./require-user";
import { prisma } from "@/lib/db";

export async function getCourseReviews() {
  const user = await requireUser();

  // Get all reviews for courses that the user is enrolled in
  const reviews = await prisma.courseRating.findMany({
    where: {
      course: {
        enrollment: {
          some: {
            userId: user.id,
            status: "Active",
          },
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          image: true,
          email: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Convert rating from Int back to float for half-star support
  // New format: rating is stored as *2 (e.g., 2.5 -> 5, 3.0 -> 6, 4.5 -> 9)
  // Old format: rating stored as 1-5 (whole numbers only)
  // If rating <= 10, it's the new format (divide by 2), otherwise it's old format (keep as is)
  // Note: 2.5 * 2 = 5, so we need to check <= 10, not > 5
  return reviews.map((review) => ({
    ...review,
    rating: review.rating <= 10 ? review.rating / 2 : review.rating,
  }));
}

export async function getUserReviewsForEnrolledCourses() {
  const user = await requireUser();

  // Get reviews that the current user has submitted for their enrolled courses
  const reviews = await prisma.courseRating.findMany({
    where: {
      userId: user.id,
      course: {
        enrollment: {
          some: {
            userId: user.id,
            status: "Active",
          },
        },
      },
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reviews;
}

export async function getEnrolledCoursesForReview() {
  const user = await requireUser();

  // Get all enrolled courses with review status
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: user.id,
      status: "Active",
    },
    include: {
      Course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      // Check if user has already reviewed this course
    },
  });

  const coursesWithReviewStatus = await Promise.all(
    enrollments.map(async (enrollment) => {
      const existingReview = await prisma.courseRating.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: enrollment.Course.id,
          },
        },
      });

      return {
        course: enrollment.Course,
        hasReviewed: !!existingReview,
        reviewId: existingReview?.id || null,
      };
    })
  );

  return coursesWithReviewStatus;
}

