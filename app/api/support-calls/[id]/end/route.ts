import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { endSupportCall, getSupportCallByStreamId } from "@/app/data/course/support-calls";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // This is the streamCallId
    const supportCall = await getSupportCallByStreamId(id);

    if (!supportCall) {
      return NextResponse.json(
        { error: "Support call not found" },
        { status: 404 }
      );
    }

    // Check if user is the creator
    if (supportCall.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to end this call" },
        { status: 403 }
      );
    }

    await endSupportCall(supportCall.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error ending support call:", error);
    return NextResponse.json(
      { error: "Failed to end support call" },
      { status: 500 }
    );
  }
}

