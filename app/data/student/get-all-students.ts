import "server-only";

import { prisma } from "@/lib/db";

export async function getAllStudents() {
  const students = await prisma.user.findMany({
    where: {
      // Only get students (users with role "user" or null, exclude admins/superadmins)
      OR: [
        { role: "user" },
        { role: null },
      ],
      // Exclude banned users
      banned: {
        not: true,
      },
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

  // Calculate ranking metrics and sort
  const studentsWithRanking = students
    .map((student) => {
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

      // Calculate overall score for ranking
      // Points (40%) + Enrollments (20%) + Completed Lessons (20%) + Quiz Points (10%) + Assignment Grade (10%)
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
      };
    })
    .sort((a, b) => b.overallScore - a.overallScore)
    .map((student, index) => ({
      ...student,
      rank: index + 1,
    }));

  return studentsWithRanking;
}

export type StudentType = Awaited<ReturnType<typeof getAllStudents>>[0];

