# 🚨 How to Fix Prisma Studio Error

## The Error You're Seeing

```
The table `public.course_rating_reaction` does not exist in the current database.
```

This happens because your Prisma schema defines tables that don't exist in your database yet.

---

## ✅ SOLUTION: Choose ONE Method Below

### **Method 1: Run SQL Script Directly (EASIEST & FASTEST)** ⭐ Recommended

**Step 1:** Open your database client
- **pgAdmin**: Right-click your database → Query Tool
- **DBeaver**: Right-click your database → SQL Editor → New SQL Script
- **TablePlus**: Click the "Query" button
- **psql**: Already ready in terminal
- **VS Code**: Install "PostgreSQL" extension, connect to DB, open SQL file

**Step 2:** Open the SQL file
- Navigate to: `scripts/apply-all-pending-migrations.sql`
- Copy all the contents (Cmd+A, Cmd+C)

**Step 3:** Paste and Execute
- Paste the SQL into your database client
- Click "Execute" or "Run" button (or press F5)
- Wait for it to complete (should take a few seconds)

**Step 4:** Regenerate Prisma Client
```bash
npx prisma generate
```

**Step 5:** Restart Prisma Studio
- Close Prisma Studio (if running)
- Run: `npx prisma studio`
- Open `http://localhost:5555`
- Click on "User" table - it should work now! ✅

---

### **Method 2: Verify What's Missing First**

Before applying, check which tables are missing:

```bash
node scripts/verify-missing-tables.js
```

This will show you exactly which tables exist and which don't.

Then follow Method 1 to apply the SQL script.

---

### **Method 3: Use Node.js Script (Alternative)**

If you prefer to run a script instead of executing SQL directly:

```bash
node scripts/apply-migrations-node.js
```

Then:
```bash
npx prisma generate
npx prisma studio
```

**Note:** This method may have limitations with complex SQL. Method 1 is more reliable.

---

### **Method 4: Use Prisma Migrate (If npm works)**

If your npm commands work properly:

```bash
# Apply all pending migrations
npx prisma migrate deploy

# Regenerate client
npx prisma generate

# Restart Prisma Studio
npx prisma studio
```

**Note:** If you get permission errors with npm, use Method 1 instead.

---

## 🔍 Verification: Did It Work?

After applying the migrations, verify:

### Option A: Use the verification script
```bash
node scripts/verify-missing-tables.js
```

You should see all tables marked with ✅ (green checkmarks).

### Option B: Check in Prisma Studio
1. Run `npx prisma generate`
2. Run `npx prisma studio`
3. Open `http://localhost:5555`
4. Try clicking on the "User" table
5. If it works without errors, you're done! ✅

### Option C: Check in your database client
Run this SQL query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'course_rating_reaction',
    'subscription_plan',
    'user_subscription',
    'invoice',
    'coupon',
    'subscription_history'
  )
ORDER BY table_name;
```

You should see all 6 tables listed.

---

## ⚠️ Troubleshooting

### "I ran the SQL but still see the error"

1. **Did you regenerate Prisma Client?**
   ```bash
   npx prisma generate
   ```

2. **Did you restart Prisma Studio?**
   - Close it completely (Ctrl+C in terminal)
   - Run `npx prisma studio` again

3. **Clear Prisma cache:**
   ```bash
   rm -rf node_modules/.prisma
   npx prisma generate
   ```

### "I get SQL errors when running the script"

The SQL script uses `IF NOT EXISTS` checks, so it's safe to run multiple times. However, if you see errors:

- **"relation already exists"** - This is OK, the table already exists
- **"syntax error"** - Make sure you're running the entire script, not just a portion
- **"permission denied"** - You need write access to your database

### "npm commands don't work (EPERM errors)"

This is a known issue with npm permissions. Use **Method 1** (run SQL directly in your database client) instead.

---

## 📋 What Tables Are Being Created?

The migration creates these tables:

1. ✅ `course_rating_reaction` - For course rating reactions (Like/Dislike)
2. ✅ `subscription_plan` - Subscription plans (Free, Pro, Business)
3. ✅ `user_subscription` - User subscription records
4. ✅ `invoice` - Invoice records for subscriptions
5. ✅ `coupon` - Coupon codes for discounts
6. ✅ `subscription_history` - History of subscription changes

Plus 5 enums:
- `SubscriptionStatus`
- `BillingCycle`
- `PaymentStatus`
- `DiscountType`
- `SubscriptionAction`

---

## ✅ Quick Checklist

- [ ] Run SQL script: `scripts/apply-all-pending-migrations.sql`
- [ ] Verify tables were created (use verification script or check database)
- [ ] Run: `npx prisma generate`
- [ ] Close and restart: `npx prisma studio`
- [ ] Test: Click on "User" table in Prisma Studio
- [ ] Success: No errors! 🎉

---

## 🆘 Still Need Help?

If you're still stuck:

1. **Check the error message** - What does it say exactly?
2. **Verify database connection** - Can you connect to your database?
3. **Check DATABASE_URL** - Is it correct in your `.env` file?
4. **Try Method 1** - Running SQL directly is the most reliable method

---

## Summary

**The Problem:** Tables defined in Prisma schema don't exist in database.

**The Solution:** Apply the migrations by running the SQL script.

**The Fix:** 3 steps:
1. Execute `scripts/apply-all-pending-migrations.sql` in your database
2. Run `npx prisma generate`
3. Restart Prisma Studio

**Expected Result:** User table loads without errors in Prisma Studio. ✅

