# How to Add Subscription Plans - Quick Guide

You're seeing "No pricing plans available" because the database is empty. Here are **3 easy ways** to add plans:

## 🚀 Method 1: Using Prisma Studio (Easiest - Visual Interface)

1. **Open Prisma Studio:**
   ```bash
   npx prisma studio
   ```
   This opens a browser window at `http://localhost:5555`

2. **Click on "subscription_plan"** in the left sidebar

3. **Click "Add record"** button

4. **Fill in the form** for each plan (see values below)

5. **Click "Save 1 change"** after each plan

---

## ⚡ Method 2: Using SQL Script (Fastest)

1. **Connect to your database** using your preferred tool (pgAdmin, DBeaver, psql, etc.)

2. **Run the SQL script:**
   ```bash
   # If using psql command line:
   psql $DATABASE_URL -f scripts/add-subscription-plans.sql
   
   # Or copy-paste the SQL from scripts/add-subscription-plans.sql into your SQL client
   ```

---

## 🛠️ Method 3: Using Node.js Script

1. **Run the seed script:**
   ```bash
   npx tsx scripts/seed-subscription-plans.ts
   ```

   If `tsx` is not installed:
   ```bash
   npm install -g tsx
   npx tsx scripts/seed-subscription-plans.ts
   ```

---

## 📋 Plan Values to Add

### Plan 1: Free
```
Name: Free
Slug: free
Description: Perfect for getting started
Price Monthly: 0
Price Yearly: 0
Is Active: ✓ (checked)
Is Popular: ✗ (unchecked)
Trial Days: 0
Max Course Access: 5
Allows Downloads: ✗
Allows Certificates: ✓
Allows Live Classes: ✗
Allows Team Access: ✗
Team Seats: 1
Priority Support: ✗
```

### Plan 2: Pro (⭐ Most Popular)
```
Name: Pro
Slug: pro
Description: For serious learners
Price Monthly: 2000 (this is $20.00 - prices are in cents)
Price Yearly: 20000 (this is $200.00 - prices are in cents)
Is Active: ✓
Is Popular: ✓ ⭐ (CHECK THIS - makes it "Most Popular")
Trial Days: 7
Max Course Access: (leave empty/null for unlimited)
Allows Downloads: ✓
Allows Certificates: ✓
Allows Live Classes: ✓
Allows Team Access: ✗
Team Seats: 1
Priority Support: ✓
```

### Plan 3: Business
```
Name: Business
Slug: business
Description: For teams & organizations
Price Monthly: 10000 (this is $100.00 - prices are in cents)
Price Yearly: 100000 (this is $1000.00 - prices are in cents)
Is Active: ✓
Is Popular: ✗
Trial Days: 14
Max Course Access: (leave empty/null for unlimited)
Allows Downloads: ✓
Allows Certificates: ✓
Allows Live Classes: ✓
Allows Team Access: ✓
Team Seats: 50
Priority Support: ✓
```

---

## ✅ After Adding Plans

1. **Refresh your browser** at `/pricing`
2. You should now see 3 pricing cards!
3. The cards will show:
   - Plan name and price
   - Monthly/Yearly toggle
   - Feature list
   - "Most Popular" badge on Pro plan
   - CTA buttons

---

## 🔔 Important Notes

- **Prices are in cents**: 2000 = $20.00, 10000 = $100.00
- **Max Course Access**: Leave empty/null for unlimited courses
- **Stripe IDs**: You can add `stripePriceIdMonthly` and `stripePriceIdYearly` later after creating products in Stripe Dashboard

---

## 🆘 Still Not Working?

1. Make sure you ran the migration:
   ```bash
   npx prisma migrate dev
   ```

2. Regenerate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Restart your dev server:
   ```bash
   npm run dev
   ```

4. Check if plans exist:
   ```bash
   npx prisma studio
   # Look for subscription_plan table
   ```

