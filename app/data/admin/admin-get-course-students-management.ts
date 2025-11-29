import "server-only";
import { prisma } from "@/lib/db";

export async function adminGetCourseStudentsManagement(courseId: string) {
  // Note: Authentication should be checked in the calling API route

  const enrollments = await prisma.enrollment.findMany({
    where: {
      courseId: courseId,
      status: "Active",
    },
    select: {
      id: true,
      createdAt: true,
      banned: true,
      banUntil: true,
      banReason: true,
      banType: true,
      followUpEmailSent: true,
      lastActivityAt: true,
      tags: true,
      certificateEarned: true,
      certificateIssuedAt: true,
      certificateKey: true,
      certificateRevoked: true,
      certificateRevokedAt: true,
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
      studentBadges: {
        select: {
          badgeType: true,
          earnedAt: true,
          metadata: true,
        },
      },
      loginSessions: {
        orderBy: {
          loggedInAt: "desc",
        },
        take: 1,
        select: {
          device: true,
          browser: true,
          country: true,
          ipAddress: true,
          loggedInAt: true,
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
      chapter: {
        select: {
          id: true,
          lessons: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    return [];
  }

  const totalLessons = course.chapter.reduce(
    (acc, chapter) => acc + chapter.lessons.length,
    0
  );

  // For each student, get their progress and points
  const students = await Promise.all(
    enrollments.map(async (enrollment) => {
      const userId = enrollment.User.id;
      let completedLessons = 0;
      let totalPoints = 0;

      // Calculate progress
      for (const chapter of course.chapter) {
        for (const lesson of chapter.lessons) {
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
        }
      }

      // Calculate total points from graded assignments
      const gradedSubmissions = await prisma.assignmentSubmission.findMany({
        where: {
          userId: userId,
          status: "Graded",
          grade: {
            not: null,
          },
          Assignment: {
            Lesson: {
              Chapter: {
                courseId: courseId,
              },
            },
          },
        },
        select: {
          grade: true,
        },
      });

      const assignmentPoints = gradedSubmissions.reduce(
        (sum, sub) => sum + (sub.grade || 0),
        0
      );

      // Get assignment analytics
      const allSubmissions = await prisma.assignmentSubmission.findMany({
        where: {
          userId: userId,
          Assignment: {
            Lesson: {
              Chapter: {
                courseId: courseId,
              },
            },
          },
        },
        select: {
          status: true,
          submittedAt: true,
          Assignment: {
            select: {
              dueDate: true,
            },
          },
        },
      });

      const totalAssignments = allSubmissions.length;
      const submittedCount = allSubmissions.filter((s) => s.status !== "Pending").length;
      const lateCount = allSubmissions.filter((s) => {
        if (!s.Assignment.dueDate || !s.submittedAt) return false;
        return new Date(s.submittedAt) > new Date(s.Assignment.dueDate);
      }).length;
      const pendingCount = allSubmissions.filter((s) => s.status === "Pending").length;

      // Get quiz analytics
      const allQuizSubmissions = await prisma.quizSubmission.findMany({
        where: {
          userId: userId,
          Quiz: {
            Lesson: {
              Chapter: {
                courseId: courseId,
              },
            },
          },
        },
        select: {
          score: true,
          totalQuestions: true,
          correctAnswers: true,
          pointsEarned: true,
          submittedAt: true,
          Quiz: {
            select: {
              id: true,
              title: true,
              points: true,
              required: true,
              Lesson: {
                select: {
                  id: true,
                  title: true,
                  position: true,
                  Chapter: {
                    select: {
                      id: true,
                      title: true,
                      position: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const totalQuizzes = await prisma.quiz.count({
        where: {
          Lesson: {
            Chapter: {
              courseId: courseId,
            },
          },
        },
      });

      const completedQuizzes = allQuizSubmissions.length;
      const passedQuizzes = allQuizSubmissions.filter((q) => q.score >= 70).length;
      const totalQuizPointsEarned = allQuizSubmissions.reduce((sum, q) => sum + q.pointsEarned, 0);
      const averageQuizScore = completedQuizzes > 0
        ? Math.round(allQuizSubmissions.reduce((sum, q) => sum + q.score, 0) / completedQuizzes)
        : 0;

      // Calculate total points (assignments + quizzes)
      totalPoints = assignmentPoints + totalQuizPointsEarned;

      // Get detailed quiz data for display
      const quizzes = allQuizSubmissions.map((submission) => ({
        quizId: submission.Quiz.id,
        quizTitle: submission.Quiz.title,
        quizPoints: submission.Quiz.points,
        quizRequired: submission.Quiz.required,
        lessonId: submission.Quiz.Lesson.id,
        lessonTitle: submission.Quiz.Lesson.title,
        chapterId: submission.Quiz.Lesson.Chapter.id,
        chapterTitle: submission.Quiz.Lesson.Chapter.title,
        chapterPosition: submission.Quiz.Lesson.Chapter.position,
        lessonPosition: submission.Quiz.Lesson.position,
        submission: {
          id: submission.id,
          score: submission.score,
          totalQuestions: submission.totalQuestions,
          correctAnswers: submission.correctAnswers,
          pointsEarned: submission.pointsEarned,
          submittedAt: submission.submittedAt,
        },
      }));

      const progressPercentage =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      // Get last login session
      const lastLogin = enrollment.loginSessions[0] || null;

      return {
        id: enrollment.User.id,
        enrollmentId: enrollment.id,
        firstName: enrollment.User.firstName,
        lastName: enrollment.User.lastName,
        email: enrollment.User.email,
        username: enrollment.User.username,
        image: enrollment.User.image,
        enrolledAt: enrollment.createdAt,
        progress: {
          totalLessons,
          completedLessons,
          percentage: progressPercentage,
        },
        lastActivity: enrollment.lastActivityAt,
        banned: enrollment.banned || false,
        banUntil: enrollment.banUntil,
        banReason: enrollment.banReason,
        banType: enrollment.banType,
        followUpEmailSent: enrollment.followUpEmailSent,
        totalPoints,
        tags: enrollment.tags || [],
        certificateEarned: enrollment.certificateEarned || false,
        certificateIssuedAt: enrollment.certificateIssuedAt,
        certificateKey: enrollment.certificateKey,
        certificateRevoked: enrollment.certificateRevoked || false,
        certificateRevokedAt: enrollment.certificateRevokedAt,
        badges: enrollment.studentBadges || [],
        loginInfo: lastLogin
          ? {
              device: lastLogin.device,
              browser: lastLogin.browser,
              country: lastLogin.country,
              ipAddress: lastLogin.ipAddress,
              lastLoginAt: lastLogin.loggedInAt,
            }
          : null,
        assignmentStats: {
          submitted: submittedCount,
          late: lateCount,
          pending: pendingCount,
          total: totalAssignments,
        },
        quizStats: {
          total: totalQuizzes,
          completed: completedQuizzes,
          passed: passedQuizzes,
          totalPointsEarned: totalQuizPointsEarned,
          averageScore: averageQuizScore,
        },
        quizzes: quizzes.sort((a, b) => {
          // Sort by chapter position, then by lesson position
          if (a.chapterPosition !== b.chapterPosition) {
            return a.chapterPosition - b.chapterPosition;
          }
          return a.lessonPosition - b.lessonPosition;
        }),
      };
    })
  );

  return students;
}

