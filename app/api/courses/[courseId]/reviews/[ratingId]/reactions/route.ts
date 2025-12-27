import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string; ratingId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { ratingId } = await params;
    const body = await request.json();
    const { reaction } = body; // "like" or "dislike"

    if (!reaction || (reaction !== "like" && reaction !== "dislike")) {
      return NextResponse.json(
        { error: "Invalid reaction type" },
        { status: 400 }
      );
    }

    // Convert "like"/"dislike" to ReactionType enum
    const reactionType = reaction === "like" ? "Like" : "Dislike";

    // Check if reaction already exists
    const existingReaction = await prisma.courseRatingReaction.findUnique({
      where: {
        ratingId_userId: {
          ratingId: ratingId,
          userId: session.user.id,
        },
      },
    });

    if (existingReaction) {
      if (existingReaction.reaction === reactionType) {
        // Remove reaction if clicking the same one
        await prisma.courseRatingReaction.delete({
          where: {
            id: existingReaction.id,
          },
        });
        return NextResponse.json({ success: true, reaction: null });
      } else {
        // Update reaction if different
        const updated = await prisma.courseRatingReaction.update({
          where: {
            id: existingReaction.id,
          },
          data: {
            reaction: reactionType,
          },
        });
        return NextResponse.json({ success: true, reaction: reaction });
      }
    } else {
      // Create new reaction
      await prisma.courseRatingReaction.create({
        data: {
          ratingId: ratingId,
          userId: session.user.id,
          reaction: reactionType,
        },
      });
      return NextResponse.json({ success: true, reaction: reaction });
    }
  } catch (error) {
    console.error("Error handling reaction:", error);
    return NextResponse.json(
      { error: "Failed to save reaction" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string; ratingId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ reactions: {} });
    }

    const { ratingId } = await params;

    // Get user's reaction for this rating
    const userReaction = await prisma.courseRatingReaction.findUnique({
      where: {
        ratingId_userId: {
          ratingId: ratingId,
          userId: session.user.id,
        },
      },
    });

    if (!userReaction) {
      return NextResponse.json({ reaction: null });
    }

    // Convert ReactionType enum to lowercase
    const reaction = userReaction.reaction.toLowerCase() as "like" | "dislike";
    return NextResponse.json({ reaction });
  } catch (error) {
    console.error("Error fetching reaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch reaction" },
      { status: 500 }
    );
  }
}

