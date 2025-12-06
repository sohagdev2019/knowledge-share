import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    await requireSuperAdmin();
    const { blogId } = await params;
    const { reason } = await request.json();

    const blog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        status: "Rejected",
        rejectedAt: new Date(),
        rejectionReason: reason || null,
      },
      include: {
        author: true,
      },
    });

    // Refund points if they were deducted
    if (blog.pointsSpent > 0) {
      await prisma.user.update({
        where: { id: blog.authorId },
        data: {
          points: {
            increment: blog.pointsSpent,
          },
        },
      });
    }

    // Create notification
    await prisma.notification.create({
      data: {
        type: "BlogRejected",
        title: "Blog Rejected",
        message: `Your blog "${blog.title}" was rejected. ${reason ? `Reason: ${reason}` : ""}`,
        link: `/blogs/write`,
        userId: blog.authorId,
      },
    });

    return NextResponse.json({
      message: "Blog rejected successfully",
      blog,
    });
  } catch (error: any) {
    console.error("Error rejecting blog:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reject blog" },
      { status: 500 }
    );
  }
}


