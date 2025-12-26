/**
 * Script to apply the organization table migration
 * 
 * Run with: DATABASE_URL="your-db-url" node scripts/apply-organization-table.js
 * OR: node scripts/apply-organization-table.js (if DATABASE_URL is in .env)
 */

const { PrismaClient } = require('../lib/generated/prisma');

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL environment variable is not set!');
  console.error('\nPlease run:');
  console.error('  DATABASE_URL="your-connection-string" node scripts/apply-organization-table.js');
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
    console.log("🔄 Applying organization table migration...");

    // Create table
    console.log("📝 Creating organization table...");
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "organization" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "ownerUserId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
      );
    `;
    console.log("✅ Table created");

    // Create index
    console.log("📝 Creating index...");
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "organization_ownerUserId_idx" 
        ON "organization"("ownerUserId");
    `;
    console.log("✅ Index created");

    // Add foreign key
    console.log("📝 Adding foreign key...");
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'organization_ownerUserId_fkey'
        ) THEN
          ALTER TABLE "organization" 
          ADD CONSTRAINT "organization_ownerUserId_fkey" 
          FOREIGN KEY ("ownerUserId") REFERENCES "user"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `;
    console.log("✅ Foreign key added");

    console.log("\n🎉 Migration applied successfully!");
    console.log("✅ The organization table is now ready to use.");
    console.log("\n💡 Please restart your development server for changes to take effect.");
  } catch (error) {
    console.error("❌ Error applying migration:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();

