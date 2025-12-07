import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: Fetch user's reaction and all reaction counts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const { blogId } = await params;
    const session = await auth();

    // Get all reaction counts
    const reactionCounts = await prisma.blogReaction.groupBy({
      by: ["type"],
      where: { blogId },
      _count: { type: true },
    });

    const counts = {
      Like: 0,
      Love: 0,
      Insightful: 0,
      Funny: 0,
    };

    reactionCounts.forEach((item) => {
      counts[item.type as keyof typeof counts] = item._count.type;
    });

    // Get user's reaction if logged in
    let userReaction = null;
    if (session?.user?.id) {
      userReaction = await prisma.blogReaction.findUnique({
        where: {
          blogId_userId: {
            blogId,
            userId: session.user.id,
          },
        },
        select: {
          type: true,
        },
      });
    }

    return NextResponse.json({
      counts,
      userReaction: userReaction?.type || null,
    });
  } catch (error: any) {
    console.error("Error fetching reactions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reactions" },
      { status: 500 }
    );
  }
}

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
      // If changing to the same type, do nothing
      if (existingReaction.type === type) {
        return NextResponse.json({ reaction: existingReaction });
      }

      const oldType = existingReaction.type;
      
      // Update existing reaction
      const reaction = await prisma.blogReaction.update({
        where: {
          id: existingReaction.id,
        },
        data: {
          type,
        },
      });

      // Update like count: decrement if old was Like, increment if new is Like
      if (oldType === "Like" && type !== "Like") {
        await prisma.blog.update({
          where: { id: blogId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        });
      } else if (oldType !== "Like" && type === "Like") {
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



