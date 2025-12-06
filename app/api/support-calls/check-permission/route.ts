import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { checkCallPermission } from "@/app/data/course/check-call-permission";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const streamCallId = searchParams.get("streamCallId");

    if (!streamCallId) {
      return NextResponse.json(
        { error: "Stream call ID is required" },
        { status: 400 }
      );
    }

    const permission = await checkCallPermission(streamCallId);

    return NextResponse.json(permission);
  } catch (error) {
    console.error("Error checking call permission:", error);
    return NextResponse.json(
      { error: "Failed to check call permission" },
      { status: 500 }
    );
  }
}
