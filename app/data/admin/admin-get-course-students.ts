import "server-only";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";

export async function adminGetCourseStudents(courseId: string) {
  await requireAdmin();

  // First get all enrollments
  const enrollments = await prisma.enrollment.findMany({
    where: {
      courseId: courseId,
      status: "Active",
    },
    select: {
      id: true,
      createdAt: true,
      userId: true,
      User: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get course structure
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      title: true,
      chapter: {
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            select: {
              id: true,
              title: true,
              position: true,
              assignment: {
                select: {
                  id: true,
                  title: true,
                  points: true,
                },
              },
              quiz: {
                select: {
                  id: true,
                  title: true,
                  points: true,
                  required: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    return [];
  }

  // For each student, get their progress and assignments
  const students = await Promise.all(
    enrollments.map(async (enrollment) => {
      const userId = enrollment.userId;
      let totalLessons = 0;
      let completedLessons = 0;
      const assignments: Array<{
        assignmentId: string;
        assignmentTitle: string;
        assignmentPoints: number;
        lessonId: string;
        lessonTitle: string;
        chapterId: string;
        chapterTitle: string;
        chapterPosition: number;
        lessonPosition: number;
        submission: {
          id: string;
          fileKey: string | null;
          link: string | null;
          description: string | null;
          status: string;
          grade: number | null;
          feedback: string | null;
          submittedAt: Date;
          submissionCount: number;
        } | null;
      }> = [];

      const quizzes: Array<{
        quizId: string;
        quizTitle: string | null;
        quizPoints: number;
        quizRequired: boolean;
        lessonId: string;
        lessonTitle: string;
        chapterId: string;
        chapterTitle: string;
        chapterPosition: number;
        lessonPosition: number;
        submission: {
          id: string;
          score: number;
          totalQuestions: number;
          correctAnswers: number;
          pointsEarned: number;
          submittedAt: Date;
        } | null;
      }> = [];

      // Calculate progress and get assignments
      for (const chapter of course.chapter) {
        for (const lesson of chapter.lessons) {
          totalLessons++;

          // Check if lesson is completed
          const progress = await prisma.lessonProgress.findUnique({
            where: {
              userId_lessonId: {
                userId: userId,
                lessonId: lesson.id,
              },
            },
            select: {
              completed: true,
            },
          });

          if (progress?.completed) {
            completedLessons++;
          }

          // Get assignment submission if exists
          if (lesson.assignment) {
            const submission = await prisma.assignmentSubmission.findFirst({
              where: {
                assignmentId: lesson.assignment.id,
                userId: userId,
              },
              select: {
                id: true,
                fileKey: true,
                link: true,
                description: true,
                status: true,
                grade: true,
                feedback: true,
                submittedAt: true,
                submissionCount: true,
              },
              orderBy: {
                submittedAt: "desc",
              },
            });

            assignments.push({
              assignmentId: lesson.assignment.id,
              assignmentTitle: lesson.assignment.title,
              assignmentPoints: lesson.assignment.points ?? 100,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              chapterId: chapter.id,
              chapterTitle: chapter.title,
              chapterPosition: chapter.position,
              lessonPosition: lesson.position,
              submission: submission || null,
            });
          }

          // Get quiz submission if exists
          if (lesson.quiz) {
            const quizSubmission = await prisma.quizSubmission.findUnique({
              where: {
                userId_quizId: {
                  userId: userId,
                  quizId: lesson.quiz.id,
                },
              },
              select: {
                id: true,
                score: true,
                totalQuestions: true,
                correctAnswers: true,
                pointsEarned: true,
                submittedAt: true,
              },
            });

            quizzes.push({
              quizId: lesson.quiz.id,
              quizTitle: lesson.quiz.title,
              quizPoints: lesson.quiz.points,
              quizRequired: lesson.quiz.required,
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              chapterId: chapter.id,
              chapterTitle: chapter.title,
              chapterPosition: chapter.position,
              lessonPosition: lesson.position,
              submission: quizSubmission || null,
            });
          }
        }
      }

      const progressPercentage =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        enrollmentId: enrollment.id,
        enrolledAt: enrollment.createdAt,
        user: {
          id: enrollment.User.id,
          firstName: enrollment.User.firstName,
          lastName: enrollment.User.lastName,
          email: enrollment.User.email,
          image: enrollment.User.image,
          username: enrollment.User.username,
        },
        progress: {
          totalLessons,
          completedLessons,
          percentage: progressPercentage,
        },
        assignments,
        quizzes,
      };
    })
  );

  return students;
}

export type CourseStudentType = Awaited<
  ReturnType<typeof adminGetCourseStudents>
>[0];

