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

    const { type } = await request.json();

    if (!["Like", "Love", "Insightful", "Funny"].includes(type)) {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
    }

    // Check if user already reacted
    const existingReaction = await prisma.blogReaction.findUnique({
      where: {
        blogId_userId: {
          blogId,
          userId: session.user.id,
        },
      },
    });

    if (existingReaction) {
      // Update existing reaction
      const reaction = await prisma.blogReaction.update({
        where: {
          id: existingReaction.id,
        },
        data: {
          type,
        },
      });

      return NextResponse.json({ reaction });
    }

    // Create new reaction
    const reaction = await prisma.blogReaction.create({
      data: {
        type,
        blogId,
        userId: session.user.id,
      },
    });

    // Update blog like count if it's a like
    if (type === "Like") {
      await prisma.blog.update({
        where: { id: blogId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({ reaction });
  } catch (error: any) {
    console.error("Error adding reaction:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add reaction" },
      { status: 500 }
    );
  }
}



