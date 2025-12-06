import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const { blogId } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, parentId } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    // Create comment
    const comment = await prisma.blogComment.create({
      data: {
        content: content.trim(),
        blogId,
        authorId: session.user.id,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            username: true,
          },
        },
      },
    });

    // Update blog comment count
    await prisma.blog.update({
      where: { id: blogId },
      data: {
        commentCount: {
          increment: 1,
        },
      },
    });

    // Award points for commenting (1 point per comment)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        points: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ comment });
  } catch (error: any) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add comment" },
      { status: 500 }
    );
  }
}



