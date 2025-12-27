# ⚠️ URGENT: Fix the Course Rating Reaction Table Error

## The Problem
The `course_rating_reaction` table **DOES NOT EXIST** in your database, causing P2021 errors.

**You MUST apply the migration to fix this!**

## ✅ QUICK FIX - Run This Command Now:

```bash
npm run migrate:reactions
```

**OR** run directly:

```bash
node scripts/apply-reaction-table.js
```

This will:
- ✅ Add 'Dislike' to ReactionType enum
- ✅ Create the `course_rating_reaction` table
- ✅ Create all indexes
- ✅ Set up foreign key constraints

## Alternative Solutions

### Option 1: Use Prisma Migrate

```bash
npx prisma migrate deploy
```

Or for development:

```bash
npx prisma migrate dev
```

### Option 2: Apply SQL Directly

Run the SQL from `apply-migration.sql` file using your database tool.

## After Applying

1. **RESTART your development server** (stop and start again)
2. The P2021 errors will be resolved
3. Your reactions API will work correctly

## What the Migration Does

- Adds 'Dislike' to the ReactionType enum (if not already present)
- Creates the `course_rating_reaction` table with all columns
- Creates unique index on (ratingId, userId)
- Creates indexes on ratingId and userId
- Sets up foreign key constraints to course_rating and user tables

