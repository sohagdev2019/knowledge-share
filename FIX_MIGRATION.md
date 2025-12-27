# 🚨 URGENT: Fix Course Rating Reaction Migration

## The Problem
Your `course_rating_reaction` table **DOES NOT EXIST** in the database, causing all reaction features to fail.

## ✅ QUICK FIX - Choose ONE method:

### Method 1: Run the Migration Script (Easiest)

**Open a NEW terminal window** (keep your dev server running) and run:

```bash
node scripts/apply-reaction-table.js
```

If you get DATABASE_URL error, run:
```bash
DATABASE_URL="your-database-url-here" node scripts/apply-reaction-table.js
```

### Method 2: Use Prisma Migrate

```bash
npx prisma migrate deploy
```

### Method 3: Use Prisma DB Push (Development only)

```bash
npx prisma db push
```

### Method 4: Run SQL Directly

1. Connect to your database (pgAdmin, DBeaver, or psql)
2. Copy and paste the SQL from `apply-migration.sql`
3. Execute it

## After Running ANY Method Above:

1. **RESTART your development server** (Ctrl+C then `npm run dev`)
2. The errors will be fixed
3. Your like/dislike buttons will work!

## What Gets Created:

- ✅ `course_rating_reaction` table
- ✅ 'Dislike' added to ReactionType enum
- ✅ All indexes and foreign keys

---

**The script is ready at: `scripts/apply-reaction-table.js`**

Just run it in a separate terminal while your dev server is running!

