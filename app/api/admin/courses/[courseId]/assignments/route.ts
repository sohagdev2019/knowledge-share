import { adminGetCourseAssignments } from "@/app/data/admin/admin-get-course-assignments";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    // Check authentication and admin role
    const session = await auth.api.getSession({
      headers: await headers(),
    });

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

    const data = await adminGetCourseAssignments(courseId);
    
    if (!data) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Failed to fetch course assignments:", error);
    
    // Handle redirect errors (from requireAdmin in adminGetCourseAssignments)
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error?.message || "Failed to fetch course assignments",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: error?.status || 500 }
    );
  }
}

