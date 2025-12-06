import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createSupportCall } from "@/app/data/course/support-calls";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, title, description, streamCallId } = body;

    if (!courseId || !streamCallId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supportCall = await createSupportCall({
      courseId,
      title,
      description,
      streamCallId,
    });

    return NextResponse.json(supportCall);
  } catch (error) {
    console.error("Error creating support call:", error);
    return NextResponse.json(
      { error: "Failed to create support call" },
      { status: 500 }
    );
  }
}


