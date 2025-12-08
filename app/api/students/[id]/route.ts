import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if user is authenticated and has role "user" - return early if so
    const session = await auth();
    if (session?.user) {
      const userRole = (session.user as any).role;
      if (userRole === "user") {
        return NextResponse.json(
          { error: "Forbidden: Access denied" },
          { status: 403 }
        );
      }
    }
    
    // Fetch single student with all related data
    const student = await withRetry(async () => {
      return await prisma.user.findFirst({
        where: {
          id,
          AND: [
            {
              OR: [
                { role: "user" },
                { role: null }
              ]
            },
            {
              OR: [
                { banned: false },
                { banned: null }
              ]
            }
          ]
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
              createdAt: true,
              course: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  fileKey: true,
                  category: true,
                  level: true,
                }
              }
            },
          },
          lessonProgress: {
            where: {
              completed: true,
            },
            select: {
              id: true,
              lessonId: true,
              completedAt: true,
              lesson: {
                select: {
                  id: true,
                  title: true,
                  chapter: {
                    select: {
                      course: {
                        select: {
                          id: true,
                          title: true,
                          slug: true,
                        }
                      }
                    }
                  }
                }
              }
            },
          },
          quizSubmissions: {
            select: {
              id: true,
              pointsEarned: true,
              createdAt: true,
            },
          },
          assignmentSubmissions: {
            where: {
              status: "Graded",
            },
            select: {
              id: true,
              grade: true,
              createdAt: true,
            },
          },
        },
      });
    }, 3, 1000);

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Calculate metrics
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

    // Calculate overall score for ranking (same formula as in getAllStudents)
    const overallScore =
      student.points * 0.4 +
      enrollmentsCount * 10 * 0.2 +
      completedLessonsCount * 5 * 0.2 +
      totalQuizPoints * 0.1 +
      averageAssignmentGrade * 0.1;

    // Get all students to calculate rank
    const allStudents = await withRetry(async () => {
      return await prisma.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { role: "user" },
                { role: null }
              ]
            },
            {
              OR: [
                { banned: false },
                { banned: null }
              ]
            }
          ]
        },
        select: {
          id: true,
          points: true,
          enrollment: {
            where: { status: "Active" },
            select: { id: true, certificateEarned: true },
          },
          lessonProgress: {
            where: { completed: true },
            select: { id: true },
          },
          quizSubmissions: {
            select: { pointsEarned: true },
          },
          assignmentSubmissions: {
            where: { status: "Graded" },
            select: { grade: true },
          },
        },
      });
    }, 3, 1000);

    // Calculate ranks for all students
    const studentsWithScores = allStudents
      .map((s) => {
        const eCount = s.enrollment.length;
        const lCount = s.lessonProgress.length;
        const qPoints = s.quizSubmissions.reduce(
          (sum, q) => sum + (q.pointsEarned || 0),
          0
        );
        const aGrade =
          s.assignmentSubmissions.length > 0
            ? s.assignmentSubmissions.reduce(
                (sum, a) => sum + (a.grade || 0),
                0
              ) / s.assignmentSubmissions.length
            : 0;
        const score =
          s.points * 0.4 +
          eCount * 10 * 0.2 +
          lCount * 5 * 0.2 +
          qPoints * 0.1 +
          aGrade * 0.1;
        return { id: s.id, score };
      })
      .sort((a, b) => b.score - a.score);

    const rank =
      studentsWithScores.findIndex((s) => s.id === id) + 1 || 1;

    // Calculate level from points (100 points per level)
    const level = Math.floor(student.points / 100) + 1;

    return NextResponse.json({
      ...student,
      enrollmentsCount,
      completedLessonsCount,
      totalQuizPoints,
      averageAssignmentGrade: Math.round(averageAssignmentGrade),
      certificatesEarned,
      overallScore,
      rank,
      level,
    });
  } catch (error) {
    console.error("Failed to fetch student:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "";
    
    if (
      errorName === "PrismaClientInitializationError" ||
      errorMessage.includes("Can't reach database server") ||
      errorMessage.includes("P1001") ||
      errorMessage.includes("P1008") ||
      errorMessage.includes("connection pool") ||
      errorMessage.includes("Timed out fetching") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("ETIMEDOUT")
    ) {
      return NextResponse.json(
        { 
          error: "Database connection failed",
          details: "The database connection pool timed out or the server is unreachable.",
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Failed to fetch student",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
