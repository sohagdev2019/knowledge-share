# How to Seed Subscription Plans

The pricing page won't show any cards until you have subscription plans in your database. Here are two ways to add them:

## Option 1: Using Prisma Studio (Recommended)

1. Run Prisma Studio:
   ```bash
   npx prisma studio
   ```

2. Navigate to the `SubscriptionPlan` model

3. Click "Add record" and create these three plans:

### Free Plan
- name: `Free`
- slug: `free`
- description: `Perfect for getting started`
- priceMonthly: `0`
- priceYearly: `0`
- isActive: `true`
- isPopular: `false`
- trialDays: `0`
- maxCourseAccess: `5`
- allowsDownloads: `false`
- allowsCertificates: `true`
- allowsLiveClasses: `false`
- allowsTeamAccess: `false`
- teamSeats: `1`
- prioritySupport: `false`

### Pro Plan (Mark as Popular)
- name: `Pro`
- slug: `pro`
- description: `For serious learners`
- priceMonthly: `2000` (this is $20.00 in cents)
- priceYearly: `20000` (this is $200.00 in cents)
- isActive: `true`
- isPopular: `true` ⭐
- trialDays: `7`
- maxCourseAccess: `null` (unlimited - leave empty)
- allowsDownloads: `true`
- allowsCertificates: `true`
- allowsLiveClasses: `true`
- allowsTeamAccess: `false`
- teamSeats: `1`
- prioritySupport: `true`

### Business Plan
- name: `Business`
- slug: `business`
- description: `For teams & organizations`
- priceMonthly: `10000` (this is $100.00 in cents)
- priceYearly: `100000` (this is $1000.00 in cents)
- isActive: `true`
- isPopular: `false`
- trialDays: `14`
- maxCourseAccess: `null` (unlimited - leave empty)
- allowsDownloads: `true`
- allowsCertificates: `true`
- allowsLiveClasses: `true`
- allowsTeamAccess: `true`
- teamSeats: `50`
- prioritySupport: `true`

## Option 2: Using the Seed Script

Run the seed script:
```bash
npx tsx scripts/seed-subscription-plans.ts
```

Or if tsx is not available:
```bash
node --loader ts-node/esm scripts/seed-subscription-plans.ts
```

## Important Notes

1. **Stripe Price IDs**: After creating the plans, you'll need to:
   - Create products in Stripe Dashboard for each plan
   - Create monthly and yearly prices in Stripe
   - Update the `stripePriceIdMonthly` and `stripePriceIdYearly` fields in the database

2. **Prices are in cents**: Remember that all price fields store values in cents (e.g., 2000 = $20.00)

3. **Refresh the page**: After adding plans, refresh your `/pricing` page to see the cards!

