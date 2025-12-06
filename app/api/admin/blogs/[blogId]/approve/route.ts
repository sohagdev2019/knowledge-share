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

    const blog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        status: "Approved",
        publishedAt: new Date(),
      },
      include: {
        author: true,
      },
    });

    // Award points for blog approval (5 points)
    await prisma.user.update({
      where: { id: blog.authorId },
      data: {
        points: {
          increment: 5,
        },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: "BlogApproved",
        title: "Blog Approved",
        message: `Your blog "${blog.title}" has been approved and published!`,
        link: `/blogs/${blog.slug}`,
        userId: blog.authorId,
      },
    });

    return NextResponse.json({
      message: "Blog approved successfully",
      blog,
    });
  } catch (error: any) {
    console.error("Error approving blog:", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve blog" },
      { status: 500 }
    );
  }
}


