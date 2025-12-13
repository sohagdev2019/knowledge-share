import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { updateSupportRequestStatus, getSupportCallById } from "@/app/data/course/support-calls";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["Accepted", "Rejected", "Completed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Get the request to find the support call
    const requestRecord = await prisma.supportCallRequest.findUnique({
      where: { id },
      include: {
        SupportCall: {
          include: {
            Course: true,
            Creator: true,
          },
        },
      },
    });

    if (!requestRecord) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Check if user is admin or course owner
    const isAdmin = (session.user as { role?: string }).role === "admin";
    const isCourseOwner = requestRecord.SupportCall.Course.userId === session.user.id;
    const isCreator = requestRecord.SupportCall.createdBy === session.user.id;

    if (!isAdmin && !isCourseOwner && !isCreator) {
      return NextResponse.json(
        { error: "You don't have permission to manage this request" },
        { status: 403 }
      );
    }

    const updatedRequest = await updateSupportRequestStatus({
      id,
      status: status as "Accepted" | "Rejected" | "Completed",
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating support call request:", error);
    return NextResponse.json(
      { error: "Failed to update support call request" },
      { status: 500 }
    );
  }
}






