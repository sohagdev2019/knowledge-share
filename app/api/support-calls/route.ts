import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getSupportCallsByCourse, getSupportCallByStreamId } from "@/app/data/course/support-calls";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const streamCallId = searchParams.get("streamCallId");

    // If streamCallId is provided, return that specific call
    if (streamCallId) {
      const supportCall = await getSupportCallByStreamId(streamCallId);
      if (!supportCall) {
        return NextResponse.json(
          { error: "Support call not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(supportCall);
    }

    // Otherwise, get calls by course
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID or Stream Call ID is required" },
        { status: 400 }
      );
    }

    const supportCalls = await getSupportCallsByCourse(courseId);

    return NextResponse.json(supportCalls, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Error fetching support calls:", error);
    return NextResponse.json(
      { error: "Failed to fetch support calls" },
      { status: 500 }
    );
  }
}


