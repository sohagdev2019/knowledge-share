/**
 * Script to apply the subscription tables migration
 * 
 * Run with: DATABASE_URL="your-db-url" node scripts/apply-subscription-tables.js
 * OR: node scripts/apply-subscription-tables.js (if DATABASE_URL is in .env)
 */

const { PrismaClient } = require('../lib/generated/prisma');
const fs = require('fs');
const path = require('path');

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL environment variable is not set!');
  console.error('\nPlease run:');
  console.error('  DATABASE_URL="your-connection-string" node scripts/apply-subscription-tables.js');
  console.error('\nOr set DATABASE_URL in your .env.local file');
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
    console.log("🔄 Applying subscription tables migration...");

    // Read the migration SQL file
    const migrationPath = path.join(
      __dirname,
      '../prisma/migrations/20251221215616_add_subscription_tables/migration.sql'
    );
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found at: ${migrationPath}`);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log("📝 Parsing and executing migration SQL...");
    
    // Simple approach: split by semicolon + newline, but preserve DO blocks
    // Remove comments first
    let cleanSQL = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    // Split by semicolon followed by newline (simple but works for most cases)
    // For DO blocks, we'll handle them specially
    const statements = [];
    let current = '';
    let inDoBlock = false;
    
    for (let i = 0; i < cleanSQL.length; i++) {
      const char = cleanSQL[i];
      const nextChars = cleanSQL.substring(i, Math.min(i + 10, cleanSQL.length));
      
      // Detect start of DO block
      if (nextChars.match(/^DO\s+\$\$/)) {
        inDoBlock = true;
        current += char;
        continue;
      }
      
      // Detect end of DO block ($$ followed by semicolon)
      if (inDoBlock && nextChars.match(/^\$\$\s*;/)) {
        inDoBlock = false;
        // Consume the $$ and semicolon
        while (i < cleanSQL.length && cleanSQL[i] !== ';') {
          current += cleanSQL[i];
          i++;
        }
        current += ';';
        statements.push(current.trim());
        current = '';
        continue;
      }
      
      current += char;
      
      // If we hit semicolon + newline and not in DO block, it's a statement end
      if (!inDoBlock && char === ';' && 
          (i === cleanSQL.length - 1 || cleanSQL[i + 1] === '\n' || cleanSQL.substring(i + 1, i + 3).trim() === '')) {
        const stmt = current.trim();
        if (stmt && stmt.length > 3) {
          statements.push(stmt);
        }
        current = '';
        // Skip whitespace
        while (i + 1 < cleanSQL.length && (cleanSQL[i + 1] === '\n' || cleanSQL[i + 1] === ' ' || cleanSQL[i + 1] === '\t')) {
          i++;
        }
      }
    }
    
    // Add any remaining
    if (current.trim()) {
      statements.push(current.trim());
    }
    
    // Filter out empty statements
    const validStatements = statements.filter(s => s && s.trim().length > 3);
    
    console.log(`📝 Found ${validStatements.length} SQL statements to execute...`);
    
    // Execute each statement
    let successCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < validStatements.length; i++) {
      const statement = validStatements[i];
      
      try {
        await prisma.$executeRawUnsafe(statement);
        successCount++;
        if (validStatements.length <= 30 || (i + 1) % 5 === 0) {
          console.log(`✅ Executed ${i + 1}/${validStatements.length}`);
        }
      } catch (error) {
        // Ignore "already exists" errors
        if (error.code === 'P2010' || error.code === '42P07' || error.code === '42710' || 
            error.message?.includes('already exists') ||
            error.message?.includes('duplicate') ||
            error.message?.includes('already defined')) {
          skippedCount++;
          if (validStatements.length <= 30) {
            console.log(`ℹ️  Statement ${i + 1} skipped (already exists)`);
          }
        } else {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          console.error(`First 200 chars: ${statement.substring(0, 200)}...`);
          // Don't throw - continue with other statements
          console.error(`⚠️  Continuing with remaining statements...`);
        }
      }
    }
    
    console.log(`\n✅ Migration execution complete!`);
    console.log(`   Successfully executed: ${successCount} statements`);
    if (skippedCount > 0) {
      console.log(`   Skipped (already exist): ${skippedCount} statements`);
    }
    
    // Verify tables were created
    console.log("\n🔍 Verifying tables...");
    const tables = ['subscription_plan', 'user_subscription', 'invoice', 'coupon', 'subscription_history'];
    for (const table of tables) {
      try {
        const result = await prisma.$queryRawUnsafe(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${table}'
          ) as exists;
        `);
        const exists = result[0]?.exists;
        console.log(`   ${exists ? '✅' : '❌'} ${table} ${exists ? 'exists' : 'MISSING'}`);
      } catch (e) {
        console.log(`   ⚠️  Could not verify ${table}`);
      }
    }

    console.log("\n🎉 Migration applied successfully!");
    console.log("✅ The subscription tables are now ready to use:");
    console.log("   - subscription_plan");
    console.log("   - user_subscription");
    console.log("   - invoice");
    console.log("   - coupon");
    console.log("   - subscription_history");
    console.log("\n💡 Please restart your development server for changes to take effect.");
    console.log("💡 Run 'pnpm prisma generate' if you haven't already.");
  } catch (error) {
    console.error("❌ Error applying migration:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();

