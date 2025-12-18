import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/db";

export async function GET() {
  try {
    // Use retry wrapper to handle transient connection failures
    const instructors = await withRetry(async () => {
      return await prisma.user.findMany({
        where: {
          OR: [
            { role: "admin" },
            { 
              courses: {
                some: {
                  status: "Published"
                }
              }
            }
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
          socialLinkedin: true,
          socialGithub: true,
          socialTwitter: true,
          socialWebsite: true,
          createdAt: true,
          courses: {
            where: {
              status: "Published",
            },
            select: {
              id: true,
              title: true,
              slug: true,
              _count: {
                select: {
                  enrollment: {
                    where: {
                      status: "Active",
                    },
                  },
                },
              },
            },
          },
          courseRatings: {
            select: {
              rating: true,
            },
          },
        },
      });
    }, 3, 1000);

    // Calculate instructor metrics
    const instructorsWithMetrics = instructors
      .map((instructor) => {
        const coursesCount = instructor.courses.length;
        const totalEnrollments = instructor.courses.reduce(
          (sum, course) => sum + course._count.enrollment,
          0
        );
        const averageRating =
          instructor.courseRatings.length > 0
            ? instructor.courseRatings.reduce(
                (sum, rating) => sum + rating.rating,
                0
              ) / instructor.courseRatings.length
            : 0;

        return {
          ...instructor,
          coursesCount,
          totalEnrollments,
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        };
      })
      .filter((instructor) => instructor.coursesCount > 0) // Only show instructors with published courses
      .sort((a, b) => {
        // Sort by total enrollments first, then by courses count
        if (b.totalEnrollments !== a.totalEnrollments) {
          return b.totalEnrollments - a.totalEnrollments;
        }
        return b.coursesCount - a.coursesCount;
      });

    return NextResponse.json(instructorsWithMetrics);
  } catch (error) {
    console.error("Failed to fetch instructors:", error);
    
    // Check if it's a database connection error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "";
    
    // Check for connection pool timeout errors
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
          details: "The database connection pool timed out or the server is unreachable.",
          troubleshooting,
          errorCode: errorName,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
    
    // Generic error response
    return NextResponse.json(
      { 
        error: "Failed to fetch instructors",
        details: errorMessage,
        errorCode: errorName,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
