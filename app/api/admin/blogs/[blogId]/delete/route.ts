import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/data/admin/require-admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    await requireAdmin();
    const { blogId } = await params;

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        author: true,
      },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

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

    await prisma.blog.delete({
      where: { id: blogId },
    });

    return NextResponse.json({
      message: "Blog deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete blog" },
      { status: 500 }
    );
  }
}














