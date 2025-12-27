# Stripe Setup Guide for Subscription Plans (Monthly Only)

**Note**: This setup is for **monthly subscription plans only**. Yearly plans are not configured.

## Step 1: Create Monthly Products in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Products** → **Add Product**

### For Personal Plan (Monthly):
- **Name**: Personal Plan
- **Description**: Perfect for individual learners
- **Price**: $7.99
- **Billing period**: Monthly (Recurring)
- **Recurring**: Yes ✅
- **Copy the Price ID** (starts with `price_...`) - This is your `stripePriceIdMonthly`

### For Team Plan (Monthly):
- **Name**: Team Plan  
- **Description**: Perfect for small teams and growing businesses
- **Price**: $19.99
- **Billing period**: Monthly (Recurring)
- **Recurring**: Yes ✅
- **Copy the Price ID** (starts with `price_...`) - This is your `stripePriceIdMonthly`

### For Enterprise Plan:
- **No Stripe product needed** - Enterprise uses custom pricing (Request for demo)
- Leave `stripePriceIdMonthly` as `null` in the database

## Step 2: Update Database with Stripe Price IDs

You have **3 options** to add Stripe Price IDs:

### Option 1: Update Seed Script (Recommended)

Edit `scripts/seed-subscription-plans.ts` and add the Stripe Price IDs:

```typescript
// Personal Plan (Monthly only)
stripePriceIdMonthly: "price_xxxxxxxxxxxxx", // Replace with your actual Stripe Monthly Price ID

// Team Plan (Monthly only)
stripePriceIdMonthly: "price_yyyyyyyyyyyyy", // Replace with your actual Stripe Monthly Price ID

// Enterprise Plan
stripePriceIdMonthly: null, // No Stripe product (uses custom pricing)
```

Then run:
```bash
npm run seed:plans
```

### Option 2: Update via Prisma Studio

1. Run Prisma Studio:
```bash
npx prisma studio
```

2. Navigate to `SubscriptionPlan` model
3. Edit each plan and add the `stripePriceIdMonthly` field
4. Save

### Option 3: Update via SQL/Database Tool

```sql
-- Personal Plan (Monthly)
UPDATE subscription_plan 
SET "stripePriceIdMonthly" = 'price_xxxxxxxxxxxxx' 
WHERE slug = 'personal';

-- Team Plan (Monthly)
UPDATE subscription_plan 
SET "stripePriceIdMonthly" = 'price_yyyyyyyyyyyyy' 
WHERE slug = 'team';

-- Enterprise Plan (No Stripe product needed)
-- stripePriceIdMonthly is already NULL
```

## Step 3: Verify

After adding the Stripe Price IDs:
1. Check that plans are updated in the database
2. Test checkout flow at `/checkout?plan=personal&billing=monthly`
3. Verify Stripe checkout session is created correctly

## Important Notes

- **Monthly Plans Only**: This setup only requires monthly subscription prices
- **Price IDs format**: Always start with `price_` (e.g., `price_1234567890abcdef`)
- **Test vs Live**: Make sure you're using test mode Price IDs if you're in development
- **Currency**: Ensure Stripe products use USD currency
- **Recurring**: Subscription plans must be set as **recurring monthly** in Stripe
- **Yearly Plans**: Not configured - `stripePriceIdYearly` should remain `null`

## Troubleshooting

- If checkout fails, verify the Price ID exists in Stripe
- Make sure Price IDs match your Stripe account mode (test/live)
- Check that the price amount matches your plan price ($7.99 for Personal, $19.99 for Team)

