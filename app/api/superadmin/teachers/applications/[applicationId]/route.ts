import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const session = await requireSuperAdmin();
    const { applicationId } = await params;
    const body = await req.json();
    const { status, rejectionReason } = body;

    if (!["Approved", "Rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const application = await prisma.teacherApplication.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        user: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Update application
    const updated = await prisma.teacherApplication.update({
      where: {
        id: applicationId,
      },
      data: {
        status,
        rejectionReason: status === "Rejected" ? rejectionReason : null,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    });

    // If approved, update user role to "admin" (teacher)
    if (status === "Approved" && application.user.role !== "admin") {
      await prisma.user.update({
        where: {
          id: application.userId,
        },
        data: {
          role: "admin",
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update teacher application:", error);
    return NextResponse.json(
      { error: "Failed to update teacher application" },
      { status: 500 }
    );
  }
}
