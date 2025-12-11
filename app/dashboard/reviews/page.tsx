"use server";

import { requireUser } from "@/app/data/user/require-user";
import { ReviewsList } from "./_components/ReviewsList";
import { getCourseReviews, getEnrolledCoursesForReview } from "@/app/data/user/get-course-reviews";
import { SubmitReviewModal } from "./_components/SubmitReviewModal";
import { formatDistanceToNow } from "@/lib/date-utils";

export default async function ReviewsPage() {
  const user = await requireUser();

  const [reviews, coursesForReview] = await Promise.all([
    getCourseReviews(),
    getEnrolledCoursesForReview(),
  ]);

  const coursesData = coursesForReview.map((item) => ({
    id: item.course.id,
    title: item.course.title,
    hasReviewed: item.hasReviewed,
    reviewId: item.reviewId,
  }));

  const formattedReviews = reviews.map((review) => ({
    id: review.id,
    userId: review.user.id,
    name: [review.user.firstName, review.user.lastName].filter(Boolean).join(" ") || review.user.email.split("@")[0],
    avatar: review.user.image || "",
    timeAgo: formatDistanceToNow(review.createdAt, { addSuffix: true }),
    rating: review.rating,
    content: review.comment || "",
    createdAt: review.createdAt.toISOString(),
    courseId: review.course.id,
    courseTitle: review.course.title,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground">
            See what learners are saying about your enrolled courses.
          </p>
        </div>
        <SubmitReviewModal courses={coursesData} />
      </div>

      <ReviewsList reviews={formattedReviews} currentUserId={user.id} />
    </div>
  );
}

