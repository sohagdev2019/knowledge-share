import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Wishlist functionality has been removed from the schema
// Return false for all wishlist checks
export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  await params; // Consume params to avoid unused variable warning
  await auth(); // Check auth but always return false
  
  // Wishlist model no longer exists, always return false
  return NextResponse.json({ isWishlisted: false }, { status: 200 });
}

// Wishlist functionality has been removed from the schema
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  await params; // Consume params
  
  // Wishlist model no longer exists
  return NextResponse.json(
    { error: "Wishlist functionality has been removed" },
    { status: 410 } // 410 Gone - indicates the resource is no longer available
  );
}

// Wishlist functionality has been removed from the schema
export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  await params; // Consume params
  
  // Wishlist model no longer exists
  return NextResponse.json(
    { error: "Wishlist functionality has been removed" },
    { status: 410 } // 410 Gone - indicates the resource is no longer available
  );
}

