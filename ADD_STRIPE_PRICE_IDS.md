# Add Stripe Price IDs to Environment Variables

## Step 1: Add to .env.local

Add these two lines to your `.env.local` file (create it if it doesn't exist in the root directory):

```bash
STRIPE_PRICE_PERSONAL_MONTHLY=price_1ShXre2MBz781G8pSJl0GON2
STRIPE_PRICE_TEAM_MONTHLY=price_1ShXrD2MBz781G8pct7HNgH5
```

## Step 2: Run the Seed Script

After adding the environment variables, run:

```bash
npm run seed:plans
```

This will update your database with the Stripe Price IDs.

## Verification

The script will show:
- ✅ Personal Plan Stripe Price ID found: price_1ShXre2MBz781G8pSJl0GON2
- ✅ Team Plan Stripe Price ID found: price_1ShXrD2MBz781G8pct7HNgH5

## What This Does

- Personal Plan ($7.99/month) → Uses `price_1ShXre2MBz781G8pSJl0GON2`
- Team Plan ($19.99/month) → Uses `price_1ShXrD2MBz781G8pct7HNgH5`
- Enterprise Plan → No Stripe Price ID (custom pricing)

## Important Notes

- Make sure `.env.local` is in your `.gitignore` file (never commit Stripe keys)
- After updating `.env.local`, restart your development server if it's running
- The seed script will automatically use these environment variables

