import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const { blogId } = await params;
    const session = await auth();
    const cookieStore = await cookies();
    
    // Create a unique view key: userId if logged in, or use IP-based identifier
    const userId = session?.user?.id;
    const ipAddress = request.headers.get("x-forwarded-for") || 
                      request.headers.get("x-real-ip") || 
                      "unknown";
    
    const viewKey = userId 
      ? `blog_view_${blogId}_user_${userId}`
      : `blog_view_${blogId}_ip_${ipAddress.split(",")[0].trim()}`;
    
    // Check if this view was already counted (using cookie)
    const viewCookie = cookieStore.get(viewKey);
    
    // If view was already counted in the last 24 hours, don't count again
    if (viewCookie) {
      return NextResponse.json({ 
        message: "View already counted",
        counted: false 
      });
    }

    // Increment view count
    await prisma.blog.update({
      where: { id: blogId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    // Set cookie to prevent duplicate counts (expires in 24 hours)
    cookieStore.set(viewKey, "1", {
      maxAge: 60 * 60 * 24, // 24 hours
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ 
      message: "View counted",
      counted: true 
    });
  } catch (error: any) {
    console.error("Error tracking view:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track view" },
      { status: 500 }
    );
  }
}
