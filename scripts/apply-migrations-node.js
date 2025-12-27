/**
 * Node.js script to apply missing migrations directly
 * This reads the SQL file and executes it against the database
 * 
 * Run: node scripts/apply-migrations-node.js
 * 
 * Requirements:
 * - Database connection must be configured in .env (DATABASE_URL)
 * - Must have write permissions to the database
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function applyMigrations() {
  console.log('🔄 Applying missing migrations...\n');

  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'apply-all-pending-migrations.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📄 SQL file loaded successfully');
    console.log(`📏 SQL file size: ${sql.length} characters\n`);

    // Split by semicolons to execute statements one by one
    // Note: This is a simple approach. For production, use proper SQL parser
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements and comments
      if (!statement || statement.length < 10) continue;

      try {
        // Execute the statement
        await prisma.$executeRawUnsafe(statement);
        successCount++;
        
        // Log progress for significant operations
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          const tableMatch = statement.match(/CREATE TABLE.*?"?(\w+)"?/i);
          if (tableMatch) {
            console.log(`✅ Created table: ${tableMatch[1]}`);
          }
        } else if (statement.toUpperCase().includes('CREATE TYPE')) {
          const typeMatch = statement.match(/CREATE TYPE.*?"?(\w+)"?/i);
          if (typeMatch) {
            console.log(`✅ Created enum: ${typeMatch[1]}`);
          }
        }
      } catch (error) {
        // Some errors are expected (e.g., "already exists")
        if (
          error.message.includes('already exists') ||
          error.message.includes('duplicate') ||
          error.code === '42P07' || // duplicate_table
          error.code === '42710' || // duplicate_object
          error.code === '42P16'    // duplicate_column
        ) {
          // Expected - object already exists, skip
          successCount++;
        } else {
          errorCount++;
          errors.push({
            statement: statement.substring(0, 100) + '...',
            error: error.message,
          });
          console.log(`⚠️  Warning on statement ${i + 1}: ${error.message.substring(0, 100)}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\n⚠️  ERRORS ENCOUNTERED:');
      errors.slice(0, 5).forEach((err, idx) => {
        console.log(`\n${idx + 1}. ${err.error}`);
        console.log(`   Statement: ${err.statement}`);
      });
      if (errors.length > 5) {
        console.log(`\n... and ${errors.length - 5} more errors`);
      }
    } else {
      console.log('\n✅ All migrations applied successfully!');
      console.log('\n📋 Next steps:');
      console.log('   1. Regenerate Prisma client: npx prisma generate');
      console.log('   2. Restart Prisma Studio: npx prisma studio');
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error('\n💡 TIP: Try running the SQL script directly in your database client instead.');
    console.error('   File: scripts/apply-all-pending-migrations.sql');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
applyMigrations().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

