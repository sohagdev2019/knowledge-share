import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
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
    
    // Main query: Get users with role="user" OR role=null, and not banned
    // Use retry wrapper to handle transient connection failures
    const students = await withRetry(async () => {
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
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        bio: true,
        designation: true,
        points: true,
        createdAt: true,
        role: true, // Include role for debugging
        banned: true, // Include banned for debugging
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
    }, 3, 1000); // Retry up to 3 times with exponential backoff starting at 1s


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

        // Exclude role and banned from response (not part of StudentType)
        const { role, banned, ...studentData } = student;
        
        return {
          ...studentData,
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

    return NextResponse.json(studentsWithRanking);
  } catch (error) {
    console.error("Failed to fetch students:", error);
    
    // Check if it's a database connection error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "";
    
    // Check for connection pool timeout errors
    if (
      errorName === "PrismaClientInitializationError" ||
      errorMessage.includes("Can't reach database server") ||
      errorMessage.includes("P1001") || // Prisma error code for connection issues
      errorMessage.includes("P1008") || // Prisma operation timeout
      errorMessage.includes("connection pool") ||
      errorMessage.includes("Timed out fetching") ||
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("ETIMEDOUT")
    ) {
      // Check if using Neon
      const isNeon = process.env.DATABASE_URL?.includes("neon.tech");
      const troubleshooting = isNeon
        ? [
            "If using Neon, ensure your database is not paused (free tier databases auto-pause after inactivity)",
            "Check your Neon dashboard to verify the database is running",
            "Try using the pooler connection string (ends with -pooler) for better connection management",
            "Verify your DATABASE_URL includes ?sslmode=require&pgbouncer=true for pooler connections",
          ]
        : [
            "Verify your DATABASE_URL is correct in .env.local",
            "Check that your database server is running and accessible",
            "Verify network connectivity and firewall settings",
            "Restart your development server after updating environment variables",
          ];
      
      return NextResponse.json(
        { 
          error: "Database connection failed",
          details: "The database connection pool timed out or the server is unreachable. This might happen if the database is paused (common with Neon), there are too many concurrent connections, or the connection string is incorrect.",
          troubleshooting,
          errorCode: errorName,
          timestamp: new Date().toISOString(),
        },
        { status: 503 } // Service Unavailable
      );
    }
    
    // Generic error response
    return NextResponse.json(
      { 
        error: "Failed to fetch students",
        details: errorMessage,
        errorCode: errorName,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
