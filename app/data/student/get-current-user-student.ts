import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StudentType } from "./get-all-students";

export async function getCurrentUserStudent(): Promise<StudentType | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const userId = (session.user as any).id;
  if (!userId) {
    return null;
  }

  const student = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
      bio: true,
      designation: true,
      points: true,
      createdAt: true,
      enrollment: {
        where: {
          status: "Active",
        },
        select: {
          id: true,
          courseId: true,
          certificateEarned: true,
        },
      },
      lessonProgress: {
        where: {
          completed: true,
        },
        select: {
          id: true,
        },
      },
      quizSubmissions: {
        select: {
          pointsEarned: true,
        },
      },
      assignmentSubmissions: {
        where: {
          status: "Graded",
        },
        select: {
          grade: true,
        },
      },
    },
  });

  if (!student) {
    return null;
  }

  // Exclude banned users
  if (student.banned === true) {
    return null;
  }

  // Exclude admins (they shouldn't be shown as students)
  if (student.role === "admin" || student.role === "superadmin") {
    return null;
  }

  // Calculate ranking metrics (same as getAllStudents)
  const enrollmentsCount = student.enrollment.length;
  const completedLessonsCount = student.lessonProgress.length;
  const totalQuizPoints = student.quizSubmissions.reduce(
    (sum, submission) => sum + (submission.pointsEarned || 0),
    0
  );
  const averageAssignmentGrade =
    student.assignmentSubmissions.length > 0
      ? student.assignmentSubmissions.reduce(
          (sum, submission) => sum + (submission.grade || 0),
          0
        ) / student.assignmentSubmissions.length
      : 0;
  const certificatesEarned = student.enrollment.filter(
    (e) => e.certificateEarned
  ).length;

  // Calculate overall score for ranking (same formula as getAllStudents)
  const overallScore =
    student.points * 0.4 +
    enrollmentsCount * 10 * 0.2 +
    completedLessonsCount * 5 * 0.2 +
    totalQuizPoints * 0.1 +
    averageAssignmentGrade * 0.1;

  return {
    ...student,
    enrollmentsCount,
    completedLessonsCount,
    totalQuizPoints,
    averageAssignmentGrade: Math.round(averageAssignmentGrade),
    certificatesEarned,
    overallScore,
    rank: 1, // Will be recalculated when merged with other students
  };
}
