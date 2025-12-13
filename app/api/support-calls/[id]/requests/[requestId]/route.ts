import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { updateSupportRequestStatus } from "@/app/data/course/support-calls";
import { canJoinSupportCallDirectly } from "@/app/data/course/support-call-permissions";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: supportCallId, requestId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'Accepted' or 'Rejected'" },
        { status: 400 }
      );
    }

    // Check if user can manage requests (admin or course owner)
    const canManage = await canJoinSupportCallDirectly(supportCallId);
    if (!canManage) {
      return NextResponse.json(
        { error: "You don't have permission to manage requests" },
        { status: 403 }
      );
    }

    // Verify the request belongs to this support call
    const supportCallRequest = await prisma.supportCallRequest.findUnique({
      where: { id: requestId },
      select: {
        supportCallId: true,
        status: true,
      },
    });

    if (!supportCallRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    if (supportCallRequest.supportCallId !== supportCallId) {
      return NextResponse.json(
        { error: "Request does not belong to this support call" },
        { status: 400 }
      );
    }

    const updatedRequest = await updateSupportRequestStatus({
      id: requestId,
      status: status as "Accepted" | "Rejected",
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating support call request:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}






