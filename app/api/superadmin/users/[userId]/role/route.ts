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
    const { role } = await request.json();

    // Validate role
    const validRoles = ["admin", "superadmin", null, ""];
    if (role !== null && role !== "" && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Don't allow changing superadmin role (security)
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (targetUser?.role === "superadmin") {
      return NextResponse.json(
        { error: "Cannot modify superadmin role" },
        { status: 403 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        role: role || null,
      },
    });

    return NextResponse.json({
      message: "Role updated successfully",
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
