import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface SubscriptionAccessResult {
  hasAccess: boolean;
  reason?: string;
  subscription?: {
    planId: string;
    planName: string;
    status: string;
  };
}

/**
 * Check if user has subscription access to a course
 * Returns true if:
 * - User has an active subscription AND course is available in subscription
 * - User has purchased the course individually
 */
export async function checkSubscriptionAccess(
  courseId: string
): Promise<SubscriptionAccessResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      hasAccess: false,
      reason: "Not authenticated",
    };
  }

  // Check if course is available in subscription
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      availableInSubscription: true,
    },
  });

  if (!course) {
    return {
      hasAccess: false,
      reason: "Course not found",
    };
  }

  // Check if user has individual purchase access
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: courseId,
      },
    },
    select: {
      status: true,
    },
  });

  if (enrollment?.status === "Active") {
    return {
      hasAccess: true,
      reason: "Individual purchase",
    };
  }

  // If course is not available in subscription, user must purchase individually
  if (!course.availableInSubscription) {
    return {
      hasAccess: false,
      reason: "Course not available in subscription plans",
    };
  }

  // Check for active subscription
  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId: session.user.id,
      status: {
        in: ["Active", "Trial"],
      },
    },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!subscription) {
    return {
      hasAccess: false,
      reason: "No active subscription",
    };
  }

  // Check if subscription allows unlimited access or check course limit
  if (
    subscription.plan.maxCourseAccess !== null &&
    subscription.plan.maxCourseAccess > 0
  ) {
    // Count courses accessed by user with this subscription
    const accessedCourses = await prisma.enrollment.count({
      where: {
        userId: session.user.id,
        status: "Active",
        Course: {
          availableInSubscription: true,
        },
      },
    });

    if (accessedCourses >= subscription.plan.maxCourseAccess) {
      return {
        hasAccess: false,
        reason: `Subscription limit reached (${subscription.plan.maxCourseAccess} courses)`,
        subscription: {
          planId: subscription.plan.id,
          planName: subscription.plan.name,
          status: subscription.status,
        },
      };
    }
  }

  return {
    hasAccess: true,
    reason: "Subscription access",
    subscription: {
      planId: subscription.plan.id,
      planName: subscription.plan.name,
      status: subscription.status,
    },
  };
}

/**
 * Check if user has a specific subscription feature
 */
export async function checkSubscriptionFeature(
  feature: "downloads" | "certificates" | "liveClasses" | "teamAccess"
): Promise<boolean> {
  const session = await auth();

  if (!session?.user?.id) {
    return false;
  }

  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId: session.user.id,
      status: {
        in: ["Active", "Trial"],
      },
    },
    include: {
      plan: true,
    },
  });

  if (!subscription) {
    return false;
  }

  switch (feature) {
    case "downloads":
      return subscription.plan.allowsDownloads;
    case "certificates":
      return subscription.plan.allowsCertificates;
    case "liveClasses":
      return subscription.plan.allowsLiveClasses;
    case "teamAccess":
      return subscription.plan.allowsTeamAccess;
    default:
      return false;
  }
}

