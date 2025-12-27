import "server-only";
import { prisma } from "./db";
import { auth } from "./auth";
import { getUserRole } from "./role-access";

export interface TeacherPlanLimits {
  maxCourses: number | null;
  maxStudents: number | null;
  storageGB: number | null;
}

export interface TeacherUsage {
  coursesUsed: number;
  studentsEnrolled: number;
  storageUsedGB: number;
}

export interface LimitStatus {
  isAtLimit: boolean;
  isNearLimit: boolean; // 80-90% used
  percentageUsed: number;
  remaining: number | null;
  limit: number | null;
}

/**
 * Get teacher plan limits from subscription
 */
export async function getTeacherPlanLimits(): Promise<TeacherPlanLimits | null> {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const role = await getUserRole();
  if (role !== "admin") {
    return null; // Only admins have teacher plans
  }

  // Get user's active subscription
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
    return null; // No active subscription
  }

  const plan = subscription.plan;
  const features = plan.features as any;

  // Extract teacher limits from features
  if (features?.teacherLimits) {
    return {
      maxCourses: features.teacherLimits.maxCourses ?? null,
      maxStudents: features.teacherLimits.maxStudents ?? null,
      storageGB: features.teacherLimits.storageGB ?? null,
    };
  }

  return null;
}

/**
 * Get current teacher usage
 */
export async function getTeacherUsage(): Promise<TeacherUsage> {
  const session = await auth();
  if (!session?.user) {
    return { coursesUsed: 0, studentsEnrolled: 0, storageUsedGB: 0 };
  }

  const role = await getUserRole();
  if (role !== "admin") {
    return { coursesUsed: 0, studentsEnrolled: 0, storageUsedGB: 0 };
  }

  // Count courses created by this teacher
  const coursesCount = await prisma.course.count({
    where: {
      userId: session.user.id,
    },
  });

  // Count total distinct students enrolled in teacher's courses
  // We need to use findMany with distinct and count the results
  // because count() doesn't support distinct
  const distinctStudents = await prisma.enrollment.findMany({
    where: {
      Course: {
        userId: session.user.id,
      },
      status: "Active",
    },
    select: {
      userId: true,
    },
    distinct: ["userId"],
  });
  const studentsCount = distinctStudents.length;

  // TODO: Calculate storage used from S3/files
  // For now, return 0 - this would need to be calculated from actual file sizes
  const storageUsedGB = 0;

  return {
    coursesUsed: coursesCount,
    studentsEnrolled: studentsCount,
    storageUsedGB,
  };
}

/**
 * Check course limit status
 */
export async function checkCourseLimit(): Promise<LimitStatus> {
  const limits = await getTeacherPlanLimits();
  const usage = await getTeacherUsage();

  if (!limits || limits.maxCourses === null) {
    return {
      isAtLimit: false,
      isNearLimit: false,
      percentageUsed: 0,
      remaining: null,
      limit: null,
    };
  }

  const percentageUsed = (usage.coursesUsed / limits.maxCourses) * 100;
  const remaining = limits.maxCourses - usage.coursesUsed;
  const isAtLimit = usage.coursesUsed >= limits.maxCourses;
  const isNearLimit = percentageUsed >= 80 && percentageUsed < 100;

  return {
    isAtLimit,
    isNearLimit,
    percentageUsed,
    remaining,
    limit: limits.maxCourses,
  };
}

/**
 * Check student limit status
 */
export async function checkStudentLimit(): Promise<LimitStatus> {
  const limits = await getTeacherPlanLimits();
  const usage = await getTeacherUsage();

  if (!limits || limits.maxStudents === null) {
    return {
      isAtLimit: false,
      isNearLimit: false,
      percentageUsed: 0,
      remaining: null,
      limit: null,
    };
  }

  const percentageUsed = (usage.studentsEnrolled / limits.maxStudents) * 100;
  const remaining = limits.maxStudents - usage.studentsEnrolled;
  const isAtLimit = usage.studentsEnrolled >= limits.maxStudents;
  const isNearLimit = percentageUsed >= 80 && percentageUsed < 100;

  return {
    isAtLimit,
    isNearLimit,
    percentageUsed,
    remaining,
    limit: limits.maxStudents,
  };
}

/**
 * Check storage limit status
 */
export async function checkStorageLimit(): Promise<LimitStatus> {
  const limits = await getTeacherPlanLimits();
  const usage = await getTeacherUsage();

  if (!limits || limits.storageGB === null) {
    return {
      isAtLimit: false,
      isNearLimit: false,
      percentageUsed: 0,
      remaining: null,
      limit: null,
    };
  }

  const percentageUsed = (usage.storageUsedGB / limits.storageGB) * 100;
  const remaining = limits.storageGB - usage.storageUsedGB;
  const isAtLimit = usage.storageUsedGB >= limits.storageGB;
  const isNearLimit = percentageUsed >= 80 && percentageUsed < 100;

  return {
    isAtLimit,
    isNearLimit,
    percentageUsed,
    remaining,
    limit: limits.storageGB,
  };
}

/**
 * Check if teacher can create a new course
 */
export async function canCreateCourse(): Promise<{ allowed: boolean; reason?: string }> {
  const courseLimit = await checkCourseLimit();
  
  if (courseLimit.isAtLimit) {
    return {
      allowed: false,
      reason: `Course limit reached on your current plan. Upgrade to create more courses.`,
    };
  }

  return { allowed: true };
}

/**
 * Check if teacher can enroll a new student
 */
export async function canEnrollStudent(): Promise<{ allowed: boolean; reason?: string }> {
  const studentLimit = await checkStudentLimit();
  
  if (studentLimit.isAtLimit) {
    return {
      allowed: false,
      reason: `Student limit reached on your current plan. Upgrade to enroll more students.`,
    };
  }

  return { allowed: true };
}

/**
 * Check if teacher can upload file (storage check)
 */
export async function canUploadFile(fileSizeMB: number): Promise<{ allowed: boolean; reason?: string }> {
  const storageLimit = await checkStorageLimit();
  
  if (storageLimit.limit === null) {
    return { allowed: true }; // Unlimited storage
  }

  const fileSizeGB = fileSizeMB / 1024;
  const usage = await getTeacherUsage();
  
  if (usage.storageUsedGB + fileSizeGB > storageLimit.limit) {
    return {
      allowed: false,
      reason: `Storage limit reached. Upgrade your plan to upload more files.`,
    };
  }

  return { allowed: true };
}

/**
 * Get current teacher subscription plan name
 */
export async function getCurrentTeacherPlanName(): Promise<string | null> {
  const session = await auth();
  if (!session?.user) {
    return null;
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

  return subscription?.plan.name || null;
}

