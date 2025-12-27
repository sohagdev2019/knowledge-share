/**
 * Script to apply subscription tables migration
 * 
 * This script applies the migration SQL directly to create the subscription tables.
 * Run with: pnpm tsx scripts/apply-subscription-tables.ts
 * Or: node --loader ts-node/esm scripts/apply-subscription-tables.ts
 */

import { PrismaClient } from "../lib/generated/prisma";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log("📦 Reading migration SQL file...");
    const migrationPath = join(
      __dirname,
      "../prisma/migrations/20251221215616_add_subscription_tables/migration.sql"
    );
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    console.log("🚀 Applying migration to database...");
    
    // Split the SQL into individual statements and execute them
    // Prisma's $executeRawUnsafe can handle multiple statements
    await prisma.$executeRawUnsafe(migrationSQL);

    console.log("✅ Migration applied successfully!");
    console.log("\nTables created:");
    console.log("  - subscription_plan");
    console.log("  - user_subscription");
    console.log("  - invoice");
    console.log("  - coupon");
    console.log("  - subscription_history");
    console.log("\nEnums created:");
    console.log("  - SubscriptionStatus");
    console.log("  - BillingCycle");
    console.log("  - PaymentStatus");
    console.log("  - DiscountType");
    console.log("  - SubscriptionAction");
    console.log("\n✨ All subscription tables are now ready!");
  } catch (error: any) {
    // Check if error is because tables already exist
    if (error.message?.includes("already exists") || error.code === "42P07") {
      console.log("ℹ️  Tables already exist. Migration may have been applied already.");
      console.log("   If you're still seeing errors, try running: pnpm prisma generate");
    } else {
      console.error("❌ Error applying migration:", error.message);
      console.error(error);
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();

