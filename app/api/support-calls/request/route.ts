import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createSupportCallRequest } from "@/app/data/course/support-calls";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { supportCallId, supportType } = body;

    if (!supportCallId) {
      return NextResponse.json(
        { error: "Support call ID is required" },
        { status: 400 }
      );
    }

    const supportRequest = await createSupportCallRequest({
      supportCallId,
      userId: session.user.id,
      supportType: supportType || "General Support",
    });

    return NextResponse.json(supportRequest);
  } catch (error: any) {
    console.error("Error creating support call request:", error);
    
    // Handle unique constraint violation (user already requested)
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "You have already requested to join this session" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create support call request" },
      { status: 500 }
    );
  }
}





