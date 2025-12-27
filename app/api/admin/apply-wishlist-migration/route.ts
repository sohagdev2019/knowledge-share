import { NextResponse } from "next/server";
import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";

/**
 * API endpoint to apply the wishlist migration
 * This applies the migration SQL directly to the database
 * 
 * Usage: POST /api/admin/apply-wishlist-migration
 */
export async function POST() {
  try {
    const user = await requireUser();
    
    // Check if user is admin (optional security check)
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    // Allow any authenticated user to run this migration (or restrict to admin)
    // if (dbUser?.role !== "admin" && dbUser?.role !== "superadmin") {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 403 }
    //   );
    // }

    console.log("🔄 Applying wishlist migration...");

    // Check if table already exists
    const tableCheck = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'wishlist'
      ) as exists;
    `;

    if (tableCheck[0]?.exists) {
      return NextResponse.json({
        success: true,
        message: "Wishlist table already exists",
        alreadyExists: true,
      });
    }

    // Apply the migration SQL
    const migrationSQL = `
      -- CreateTable
      CREATE TABLE "wishlist" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "courseId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id")
      );

      -- CreateIndex
      CREATE INDEX "wishlist_userId_idx" ON "wishlist"("userId");

      -- CreateIndex
      CREATE INDEX "wishlist_courseId_idx" ON "wishlist"("courseId");

      -- CreateIndex
      CREATE UNIQUE INDEX "wishlist_userId_courseId_key" ON "wishlist"("userId", "courseId");

      -- AddForeignKey
      ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

      -- AddForeignKey
      ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `;

    await prisma.$executeRawUnsafe(migrationSQL);

    // Verify the table was created
    const verifyCheck = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'wishlist'
      ) as exists;
    `;

    if (!verifyCheck[0]?.exists) {
      throw new Error("Table creation failed - table still does not exist after migration");
    }

    // Get table structure for verification
    const tableInfo = await prisma.$queryRaw<Array<{ column_name: string; data_type: string }>>`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'wishlist' 
      ORDER BY ordinal_position;
    `;

    console.log("✅ Successfully applied wishlist migration!");

    return NextResponse.json({
      success: true,
      message: "Wishlist migration applied successfully",
      tableStructure: tableInfo,
    });
  } catch (error) {
    console.error("❌ Error applying migration:", error);
    
    // Check if it's a "already exists" error (which is fine)
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("already exists") || errorMessage.includes("duplicate")) {
      return NextResponse.json({
        success: true,
        message: "Migration partially applied - some objects already exist",
        warning: "Some database objects already existed, but migration completed",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to apply migration",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

