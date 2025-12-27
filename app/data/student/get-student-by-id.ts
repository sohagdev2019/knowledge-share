import "server-only";

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export async function getStudentById(id: string) {
  const student = await prisma.user.findFirst({
    where: {
      id: id,
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
      username: true,
      phoneNumber: true,
      socialWebsite: true,
      socialGithub: true,
      socialFacebook: true,
      socialTwitter: true,
      socialLinkedin: true,
      enrollment: {
        where: {
          status: "Active",
        },
        select: {
          id: true,
          courseId: true,
          certificateEarned: true,
          Course: {
            select: {
              id: true,
              title: true,
              slug: true,
              fileKey: true,
              level: true,
              category: true,
            },
          },
        },
      },
      lessonProgress: {
        where: {
          completed: true,
        },
        select: {
          id: true,
          lessonId: true,
          Lesson: {
            select: {
              id: true,
              title: true,
              Chapter: {
                select: {
                  Course: {
                    select: {
                      id: true,
                      title: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
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
    return notFound();
  }

  // Calculate ranking metrics
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

  return {
    ...student,
    enrollmentsCount,
    completedLessonsCount,
    totalQuizPoints,
    averageAssignmentGrade: Math.round(averageAssignmentGrade),
    certificatesEarned,
  };
}

export type StudentProfileType = Awaited<ReturnType<typeof getStudentById>>;
