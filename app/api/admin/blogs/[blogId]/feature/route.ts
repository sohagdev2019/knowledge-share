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
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        isFeatured: !blog.isFeatured,
      },
    });

    return NextResponse.json({
      message: updatedBlog.isFeatured ? "Blog featured successfully" : "Blog unfeatured successfully",
      blog: updatedBlog,
    });
  } catch (error: any) {
    console.error("Error toggling feature:", error);
    return NextResponse.json(
      { error: error.message || "Failed to toggle feature" },
      { status: 500 }
    );
  }
}














