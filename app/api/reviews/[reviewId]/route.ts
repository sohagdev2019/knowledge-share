import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { z } from "zod";

const editReviewSchema = z.object({
  rating: z.number().min(0.5, "Rating must be at least 0.5").max(5.0, "Rating must be at most 5.0"),
  comment: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const user = await requireUser();
    const { reviewId } = await params;

    const body = await req.json();
    const validation = editReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          status: "error",
          message: validation.error.errors.map((e) => e.message).join(", "),
        } as ApiResponse,
        { status: 400 }
      );
    }

    const { rating, comment } = validation.data;

    // Check if review exists and belongs to the user
    const existingReview = await prisma.courseRating.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        {
          status: "error",
          message: "Review not found",
        } as ApiResponse,
        { status: 404 }
      );
    }

    if (existingReview.userId !== user.id) {
      return NextResponse.json(
        {
          status: "error",
          message: "You can only edit your own reviews",
        } as ApiResponse,
        { status: 403 }
      );
    }

    // Check if review was created within 24 hours
    const reviewDate = existingReview.createdAt;
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreation > 24) {
      return NextResponse.json(
        {
          status: "error",
          message: "You can only edit reviews within 24 hours of creation",
        } as ApiResponse,
        { status: 403 }
      );
    }

    // Store rating as Int (multiply by 2 to support half ratings)
    const ratingAsInt = Math.round(rating * 2);

    await prisma.courseRating.update({
      where: {
        id: reviewId,
      },
      data: {
        rating: ratingAsInt,
        comment: comment || null,
      },
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Review updated successfully",
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "An unexpected error occurred. Please try again.",
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const user = await requireUser();
    const { reviewId } = await params;

    // Check if review exists and belongs to the user
    const existingReview = await prisma.courseRating.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        {
          status: "error",
          message: "Review not found",
        } as ApiResponse,
        { status: 404 }
      );
    }

    if (existingReview.userId !== user.id) {
      return NextResponse.json(
        {
          status: "error",
          message: "You can only delete your own reviews",
        } as ApiResponse,
        { status: 403 }
      );
    }

    // Check if review was created within 24 hours
    const reviewDate = existingReview.createdAt;
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreation > 24) {
      return NextResponse.json(
        {
          status: "error",
          message: "You can only delete reviews within 24 hours of creation",
        } as ApiResponse,
        { status: 403 }
      );
    }

    await prisma.courseRating.delete({
      where: {
        id: reviewId,
      },
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Review deleted successfully",
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "An unexpected error occurred. Please try again.",
      } as ApiResponse,
      { status: 500 }
    );
  }
}
