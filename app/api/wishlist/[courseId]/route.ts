import { NextResponse } from "next/server";
import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";

// Helper function to ensure wishlist table exists
async function ensureWishlistTableExists() {
  try {
    // Check if table exists
    const tableCheck = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'wishlist'
      ) as exists;
    `;

    if (tableCheck[0]?.exists) {
      return true;
    }

    // Table doesn't exist, create it
    console.log("⚠️  Wishlist table not found. Creating it now...");
    
    // Execute each statement separately to avoid P2010 errors
    try {
      // Create table
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "wishlist" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "courseId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id")
        )
      `);

      // Create indexes separately
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "wishlist_userId_idx" ON "wishlist"("userId")
      `);

      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "wishlist_courseId_idx" ON "wishlist"("courseId")
      `);

      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "wishlist_userId_courseId_key" ON "wishlist"("userId", "courseId")
      `);

      // Add foreign keys if they don't exist
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'wishlist_userId_fkey'
          ) THEN
            ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'wishlist_courseId_fkey'
          ) THEN
            ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_courseId_fkey" 
            FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$;
      `);
    } catch (sqlError) {
      // Check if it's a "already exists" error (which is fine)
      const errorMsg = sqlError instanceof Error ? sqlError.message : String(sqlError);
      if (errorMsg.includes("already exists") || errorMsg.includes("duplicate")) {
        console.log("Note: Some database objects already exist, continuing...");
      } else {
        throw sqlError;
      }
    }

    console.log("✅ Wishlist table created successfully!");
    return true;
  } catch (error) {
    console.error("Failed to create wishlist table:", error);
    return false;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const user = await requireUser();

    // Ensure table exists before querying
    const tableExists = await ensureWishlistTableExists();
    if (!tableExists) {
      return NextResponse.json(
        { error: "Wishlist table could not be created. Please run the migration." },
        { status: 500 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if course is in user's wishlist
    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
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
    
    // If it's a table doesn't exist error, try to create it
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("does not exist") || errorMessage.includes("P2021")) {
      const tableExists = await ensureWishlistTableExists();
      if (tableExists) {
        // Retry the request - get params again
        try {
          const resolvedParams = await params;
          const retryUser = await requireUser();
          const wishlistItem = await prisma.wishlist.findUnique({
            where: {
              userId_courseId: {
                userId: retryUser.id,
                courseId: resolvedParams.courseId,
              },
            },
          });
          return NextResponse.json(
            { isWishlisted: !!wishlistItem },
            { status: 200 }
          );
        } catch (retryError) {
          // Fall through to error response
        }
      }
    }
    
    return NextResponse.json(
      { error: "Failed to check wishlist status" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const user = await requireUser();

    // Ensure table exists before querying
    const tableExists = await ensureWishlistTableExists();
    if (!tableExists) {
      return NextResponse.json(
        { error: "Wishlist table could not be created. Please run the migration." },
        { status: 500 }
      );
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Add to wishlist (upsert to handle duplicates gracefully)
    await prisma.wishlist.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
      create: {
        userId: user.id,
        courseId: courseId,
      },
      update: {}, // No update needed if it already exists
    });

    return NextResponse.json(
      { message: "Added to wishlist" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    
    // If it's a table doesn't exist error, try to create it and retry
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("does not exist") || errorMessage.includes("P2021")) {
      const tableExists = await ensureWishlistTableExists();
      if (tableExists) {
        // Retry the request - get params again
        try {
          const resolvedParams = await params;
          const retryUser = await requireUser();
          await prisma.wishlist.upsert({
            where: {
              userId_courseId: {
                userId: retryUser.id,
                courseId: resolvedParams.courseId,
              },
            },
            create: {
              userId: retryUser.id,
              courseId: resolvedParams.courseId,
            },
            update: {},
          });
          return NextResponse.json(
            { message: "Added to wishlist" },
            { status: 200 }
          );
        } catch (retryError) {
          // Fall through to error response
        }
      }
    }
    
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const user = await requireUser();

    // Ensure table exists before querying
    const tableExists = await ensureWishlistTableExists();
    if (!tableExists) {
      return NextResponse.json(
        { error: "Wishlist table could not be created. Please run the migration." },
        { status: 500 }
      );
    }

    // Remove from wishlist
    await prisma.wishlist.deleteMany({
      where: {
        userId: user.id,
        courseId: courseId,
      },
    });

    return NextResponse.json(
      { message: "Removed from wishlist" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    
    // If it's a table doesn't exist error, table was just created, so item doesn't exist anyway
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("does not exist") || errorMessage.includes("P2021")) {
      // If table doesn't exist, item can't be in wishlist, so return success
      return NextResponse.json(
        { message: "Removed from wishlist" },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}

