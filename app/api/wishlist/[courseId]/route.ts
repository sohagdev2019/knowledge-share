import { NextResponse } from "next/server";
import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ isWishlisted: false }, { status: 200 });
    }

    const { courseId } = await params;

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId,
        },
      },
    });

    return NextResponse.json(
      { isWishlisted: !!wishlistItem },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking wishlist status:", error);
    return NextResponse.json(
      { error: "Failed to check wishlist status" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await requireUser();
    const { courseId } = await params;

    // Verify the wishlist item belongs to the user
    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
    });

    if (!wishlistItem) {
      return NextResponse.json(
        { error: "Wishlist item not found" },
        { status: 404 }
      );
    }

    // Delete the wishlist item
    await prisma.wishlist.delete({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
    });

    return NextResponse.json(
      { message: "Removed from wishlist" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await requireUser();
    const { courseId } = await params;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Already in wishlist" },
        { status: 200 }
      );
    }

    // Add to wishlist
    await prisma.wishlist.create({
      data: {
        userId: user.id,
        courseId: courseId,
      },
    });

    return NextResponse.json(
      { message: "Added to wishlist" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

