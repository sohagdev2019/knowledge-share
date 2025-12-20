/**
 * Script to apply the wishlist table migration
 * 
 * This script applies the migration SQL directly to the database
 * following the DATABASE_SYNC_GUIDE.md approach for when DB is out of sync.
 * 
 * Usage:
 *   npx ts-node scripts/apply-wishlist-migration.ts
 *   OR
 *   node -r ts-node/register scripts/apply-wishlist-migration.ts
 */

import { prisma } from "../lib/db";

const migrationSQL = `
-- CreateTable
CREATE TABLE IF NOT EXISTS "wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (only if table was just created)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'wishlist_userId_idx') THEN
        CREATE INDEX "wishlist_userId_idx" ON "wishlist"("userId");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'wishlist_courseId_idx') THEN
        CREATE INDEX "wishlist_courseId_idx" ON "wishlist"("courseId");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'wishlist_userId_courseId_key') THEN
        CREATE UNIQUE INDEX "wishlist_userId_courseId_key" ON "wishlist"("userId", "courseId");
    END IF;
END $$;

-- AddForeignKey (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'wishlist_userId_fkey'
    ) THEN
        ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'wishlist_courseId_fkey'
    ) THEN
        ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_courseId_fkey" 
        FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
`;

async function applyMigration() {
  try {
    console.log("🔄 Applying wishlist migration...");
    
    // Check if table already exists
    const tableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'wishlist'
      ) as exists;
    `;
    
    if (tableExists[0]?.exists) {
      console.log("✅ Wishlist table already exists!");
      console.log("   Verifying indexes and constraints...");
    }
    
    // Apply the migration SQL
    await prisma.$executeRawUnsafe(migrationSQL);
    
    console.log("✅ Successfully applied wishlist migration!");
    console.log("\n📋 Migration applied:");
    console.log("   - Created 'wishlist' table");
    console.log("   - Added indexes on userId and courseId");
    console.log("   - Added unique constraint on (userId, courseId)");
    console.log("   - Added foreign key constraints");
    
    // Verify the table structure
    const tableInfo = await prisma.$queryRaw<Array<{ column_name: string; data_type: string }>>`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'wishlist' 
      ORDER BY ordinal_position;
    `;
    
    console.log("\n📊 Table structure:");
    tableInfo.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    console.log("\n✨ Next steps:");
    console.log("   1. Run: pnpm prisma generate (if not already done)");
    console.log("   2. Mark migration as applied: pnpm prisma migrate resolve --applied 20251220174331_add_wishlist_table");
    console.log("   3. Test wishlist functionality in your app");
    
  } catch (error) {
    console.error("❌ Error applying migration:", error);
    
    if (error instanceof Error) {
      // Check if it's a "already exists" error (which is fine)
      if (error.message.includes("already exists") || error.message.includes("duplicate")) {
        console.log("\n⚠️  Some objects already exist, but that's okay!");
        console.log("   The migration has been partially applied.");
      } else {
        console.error("\n💡 Error details:", error.message);
      }
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
applyMigration();

