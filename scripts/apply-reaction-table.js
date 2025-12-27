/**
 * Script to apply the course_rating_reaction table migration
 * 
 * Run with: DATABASE_URL="your-db-url" node scripts/apply-reaction-table.js
 * OR: node scripts/apply-reaction-table.js (if DATABASE_URL is in .env)
 */

const { PrismaClient } = require('../lib/generated/prisma');

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL environment variable is not set!');
  console.error('\nPlease run:');
  console.error('  DATABASE_URL="your-connection-string" node scripts/apply-reaction-table.js');
  console.error('\nOr set DATABASE_URL in your .env file');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function applyMigration() {
  try {
    console.log("🔄 Applying course_rating_reaction table migration...");

    // Add 'Dislike' to ReactionType enum if it doesn't exist
    console.log("📝 Adding 'Dislike' to ReactionType enum...");
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'Dislike' 
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ReactionType')
        ) THEN
          ALTER TYPE "ReactionType" ADD VALUE 'Dislike';
        END IF;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    console.log("✅ ReactionType enum updated");

    // Create table
    console.log("📝 Creating course_rating_reaction table...");
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "course_rating_reaction" (
        "id" TEXT NOT NULL,
        "ratingId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "reaction" "ReactionType" NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "course_rating_reaction_pkey" PRIMARY KEY ("id")
      );
    `;
    console.log("✅ Table created");

    // Create indexes
    console.log("📝 Creating indexes...");
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "course_rating_reaction_ratingId_userId_key" 
        ON "course_rating_reaction"("ratingId", "userId");
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "course_rating_reaction_ratingId_idx" 
        ON "course_rating_reaction"("ratingId");
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "course_rating_reaction_userId_idx" 
        ON "course_rating_reaction"("userId");
    `;
    console.log("✅ Indexes created");

    // Add foreign keys
    console.log("📝 Adding foreign keys...");
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'course_rating_reaction_ratingId_fkey'
        ) THEN
          ALTER TABLE "course_rating_reaction" 
          ADD CONSTRAINT "course_rating_reaction_ratingId_fkey" 
          FOREIGN KEY ("ratingId") REFERENCES "course_rating"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `;
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'course_rating_reaction_userId_fkey'
        ) THEN
          ALTER TABLE "course_rating_reaction" 
          ADD CONSTRAINT "course_rating_reaction_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "user"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `;
    console.log("✅ Foreign keys added");

    console.log("\n🎉 Migration applied successfully!");
    console.log("✅ The course_rating_reaction table is now ready to use.");
    console.log("\n💡 Please restart your development server for changes to take effect.");
  } catch (error) {
    console.error("❌ Error applying migration:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();

