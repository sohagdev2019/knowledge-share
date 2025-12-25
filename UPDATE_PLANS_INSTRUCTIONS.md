# How to Update Subscription Plans in Database

The seed script has been updated with your new plan features. To update the database, run:

## Option 1: Using npm script (Recommended)

```bash
npm run seed:plans
```

## Option 2: Using npx directly

```bash
npx tsx scripts/seed-subscription-plans.ts
```

## Option 3: If tsx is not available, install it first

```bash
npm install -D tsx
npm run seed:plans
```

## What the script does:

✅ Updates Personal plan:
   - 3 courses (was 20)
   - No mobile app access
   - No Live Q&A sessions
   - 7-day trial

✅ Updates Team plan:
   - 10 courses (was 200)
   - 5 team members (was 10)
   - No mobile app access
   - 14-day trial

✅ Updates Enterprise plan:
   - Unlimited courses
   - Unlimited team members
   - Mobile app access included
   - 30-day trial

## After running the script:

1. Refresh your browser at `/pricing`
2. The UI should now show the updated features

## Troubleshooting:

If you get an error, make sure:
- Your `.env.local` file has `DATABASE_URL` set
- You have database access
- Prisma client is generated: `npx prisma generate`

