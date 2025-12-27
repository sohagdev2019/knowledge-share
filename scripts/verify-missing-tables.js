/**
 * Verification script to check which tables are missing from the database
 * Run: node scripts/verify-missing-tables.js
 */

const { PrismaClient } = require('../lib/generated/prisma');
const prisma = new PrismaClient();

async function checkTables() {
  const requiredTables = [
    'course_rating_reaction',
    'subscription_plan',
    'user_subscription',
    'invoice',
    'coupon',
    'subscription_history',
  ];

  console.log('🔍 Checking for required tables...\n');

  const missingTables = [];
  const existingTables = [];

  for (const tableName of requiredTables) {
    try {
      // Try to query the table
      await prisma.$queryRawUnsafe(`SELECT 1 FROM "${tableName}" LIMIT 1`);
      existingTables.push(tableName);
      console.log(`✅ ${tableName} - EXISTS`);
    } catch (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        missingTables.push(tableName);
        console.log(`❌ ${tableName} - MISSING`);
      } else {
        console.log(`⚠️  ${tableName} - ERROR: ${error.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Existing tables: ${existingTables.length}`);
  console.log(`❌ Missing tables: ${missingTables.length}`);

  if (missingTables.length > 0) {
    console.log('\n⚠️  MISSING TABLES:');
    missingTables.forEach((table) => {
      console.log(`   - ${table}`);
    });
    console.log('\n📋 ACTION REQUIRED:');
    console.log('   Run the SQL script: scripts/apply-all-pending-migrations.sql');
    console.log('   Or use: npx prisma migrate deploy');
  } else {
    console.log('\n✅ All required tables exist!');
    console.log('   If you still see errors, try: npx prisma generate');
  }

  await prisma.$disconnect();
}

checkTables().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

