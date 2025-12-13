import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await requireSuperAdmin();
    const { userId } = await params;
    const body = await req.json();
    const { banned, banReason, banExpires } = body;

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        banned: banned ?? true,
        banReason: banned ? banReason : null,
        banExpires: banned && banExpires ? new Date(banExpires) : null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        banned: true,
        banReason: true,
        banExpires: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to suspend user:", error);
    return NextResponse.json(
      { error: "Failed to suspend user" },
      { status: 500 }
    );
  }
}
