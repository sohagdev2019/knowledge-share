import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { z } from "zod";

const submitReviewSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  rating: z.number().min(0.5, "Rating must be at least 0.5").max(5.0, "Rating must be at most 5.0"),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const body = await req.json();
    const validation = submitReviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          status: "error",
          message: validation.error.errors.map((e) => e.message).join(", "),
        } as ApiResponse,
        { status: 400 }
      );
    }

    const { courseId, rating, comment } = validation.data;

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
        status: "Active",
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        {
          status: "error",
          message: "You must be enrolled in this course to submit a review",
        } as ApiResponse,
        { status: 403 }
      );
    }

    // Check if user has already reviewed this course
    const existingReview = await prisma.courseRating.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        {
          status: "error",
          message: "You have already reviewed this course",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Store rating as Int (multiply by 2 to support half ratings)
    // e.g., 2.5 -> 5, 3.0 -> 6, 4.5 -> 9
    // TODO: Update schema to Float for better half-rating support
    const ratingAsInt = Math.round(rating * 2);

    await prisma.courseRating.create({
      data: {
        userId: user.id,
        courseId: courseId,
        rating: ratingAsInt,
        comment: comment || null,
      },
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Review submitted successfully",
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "An unexpected error occurred. Please try again.",
      } as ApiResponse,
      { status: 500 }
    );
  }
}

