import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createSupportCallRequest } from "@/app/data/course/support-calls";
import { canJoinSupportCallDirectly } from "@/app/data/course/support-call-permissions";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      // Check content type
      const contentType = request.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Invalid content type:", contentType);
        return NextResponse.json(
          { error: "Content-Type must be application/json" },
          { status: 400 }
        );
      }

      body = await request.json();
      
      if (!body || typeof body !== "object") {
        return NextResponse.json(
          { error: "Request body must be a valid JSON object" },
          { status: 400 }
        );
      }
    } catch (error: any) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { error: `Invalid request body: ${error.message || "Malformed JSON"}` },
        { status: 400 }
      );
    }
    
    const { supportType } = body;
    const { id: supportCallId } = await params;

    if (!supportType) {
      return NextResponse.json(
        { error: "Support type is required" },
        { status: 400 }
      );
    }

    // Check if user can join directly (admin/owner)
    const canJoinDirectly = await canJoinSupportCallDirectly(supportCallId);
    if (canJoinDirectly) {
      return NextResponse.json(
        { error: "You can join directly without a request" },
        { status: 400 }
      );
    }

    // Check if support call exists and is active
    const supportCall = await prisma.supportCall.findUnique({
      where: { id: supportCallId },
      select: {
        status: true,
      },
    });

    if (!supportCall) {
      return NextResponse.json(
        { error: "Support session not found" },
        { status: 404 }
      );
    }

    if (supportCall.status !== "Active") {
      return NextResponse.json(
        { error: "Support session is not active" },
        { status: 400 }
      );
    }

    // Check if request already exists
    const existingRequest = await prisma.supportCallRequest.findUnique({
      where: {
        supportCallId_userId: {
          supportCallId,
          userId: (session.user as { id: string }).id,
        },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "Accepted") {
        return NextResponse.json(
          { error: "You already have an accepted request" },
          { status: 400 }
        );
      }
      if (existingRequest.status === "Pending") {
        return NextResponse.json(
          { error: "You already have a pending request" },
          { status: 400 }
        );
      }
      // If rejected, allow creating a new request
    }

    const supportCallRequest = await createSupportCallRequest({
      supportCallId,
      userId: (session.user as { id: string }).id,
      supportType,
    });

    return NextResponse.json(supportCallRequest);
  } catch (error: any) {
    console.error("Error creating support call request:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to create request";
    if (error?.code === "P2002") {
      errorMessage = "You have already requested to join this session";
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

