import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Get all reactions for a course's reviews for the current user
export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ reactions: {} });
    }

    const { courseId } = await params;

    // Get all ratings for this course
    const ratings = await prisma.courseRating.findMany({
      where: {
        courseId: courseId,
      },
      select: {
        id: true,
      },
    });

    const ratingIds = ratings.map((r) => r.id);

    // Get all user's reactions for these ratings
    const reactions = await prisma.courseRatingReaction.findMany({
      where: {
        ratingId: {
          in: ratingIds,
        },
        userId: session.user.id,
      },
      select: {
        ratingId: true,
        reaction: true,
      },
    });

    // Convert to map: ratingId -> "like" | "dislike"
    const reactionsMap: Record<string, "like" | "dislike"> = {};
    reactions.forEach((r) => {
      reactionsMap[r.ratingId] = r.reaction.toLowerCase() as "like" | "dislike";
    });

    return NextResponse.json({ reactions: reactionsMap });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch reactions" },
      { status: 500 }
    );
  }
}

