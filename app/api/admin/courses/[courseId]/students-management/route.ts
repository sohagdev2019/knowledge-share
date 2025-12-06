import { adminGetCourseStudentsManagement } from "@/app/data/admin/admin-get-course-students-management";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    // Check authentication directly in API route
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    if ((session.user as { role?: string }).role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const { courseId } = await params;
    
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const students = await adminGetCourseStudentsManagement(courseId);
    return NextResponse.json(students);
  } catch (error: any) {
    console.error("Failed to fetch students:", error);
    
    // Handle redirect errors (from requireAdmin)
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { 
        error: error?.message || "Failed to fetch students",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: error?.status || 500 }
    );
  }
}

