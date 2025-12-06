import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireSuperAdmin();
    const { userId } = await params;
    const { banned } = await request.json();

    // Don't allow banning superadmin (security)
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (targetUser?.role === "superadmin") {
      return NextResponse.json(
        { error: "Cannot ban superadmin" },
        { status: 403 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        banned: banned,
      },
    });

    return NextResponse.json({
      message: `User ${banned ? "banned" : "unbanned"} successfully`,
    });
  } catch (error) {
    console.error("Error updating user ban status:", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}
