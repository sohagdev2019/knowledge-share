# Testing Stripe Webhooks Locally

This guide will help you test Stripe subscription webhooks in your local development environment.

## Prerequisites

1. **Stripe CLI** installed
   - macOS: `brew install stripe/stripe-cli/stripe`
   - Linux/Windows: See [Stripe CLI Installation](https://stripe.com/docs/stripe-cli)

2. **Stripe Account** (test mode)
   - Sign up at [stripe.com](https://stripe.com)
   - Get your test API keys from the Dashboard

3. **Environment Variables** configured in `.env.local`

## Quick Start

### Step 1: Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from https://github.com/stripe/stripe-cli/releases
```

### Step 2: Login to Stripe CLI

```bash
stripe login
```

This will open your browser to authenticate with Stripe.

### Step 3: Get Webhook Secret

Run the webhook forwarding command to get your local webhook secret:

```bash
# Start webhook forwarding (this will show you the webhook secret)
stripe listen --forward-to http://localhost:3000/api/webhook/stripe
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### Step 4: Add Webhook Secret to .env.local

Copy the webhook secret and add it to your `.env.local` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Step 5: Start Your Development Server

In a separate terminal, start your Next.js app:

```bash
npm run dev
# or
pnpm dev
```

### Step 6: Keep Webhook Forwarding Running

Keep the `stripe listen` command running in one terminal while you test.

## Testing Subscription Webhooks

### Test 1: Subscription Created (checkout.session.completed)

1. Go to your pricing page: `http://localhost:3000/pricing`
2. Click "Subscribe" on any plan
3. Complete the checkout with a test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
4. Check your terminal/logs to see the webhook event processed

### Test 2: Subscription Updated

You can trigger this manually using Stripe CLI:

```bash
# Trigger a subscription update event
stripe trigger customer.subscription.updated
```

### Test 3: Subscription Cancelled

```bash
# Trigger a subscription cancellation event
stripe trigger customer.subscription.deleted
```

### Test 4: Payment Failed

```bash
# Trigger a payment failed event
stripe trigger invoice.payment_failed
```

## Using the Test Script

We've provided a helper script to make this easier:

```bash
# Make it executable
chmod +x scripts/test-stripe-webhook.sh

# Run it
./scripts/test-stripe-webhook.sh
```

## Webhook Events Handled

The webhook handler processes these events:

### User Subscriptions (Legacy)
- `checkout.session.completed` - New subscription created
- `customer.subscription.updated` - Subscription updated (upgrade/downgrade)
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed

### Organization Subscriptions
- `checkout.session.completed` (with `orgId` metadata) - Org subscription created
- `customer.subscription.updated` (with org context) - Org subscription updated

## Testing Specific Scenarios

### Test Teacher Plan Subscription

1. Login as an admin user
2. Go to `/pricing` (should show teacher plans)
3. Select "Pro Teacher" plan
4. Complete checkout
5. Check database: `UserSubscription` table should have new record
6. Check Stripe Dashboard: Subscription should be active

### Test Subscription Upgrade

1. User has active "Starter Teacher" subscription
2. Go to `/pricing`
3. Click "Upgrade" on "Pro Teacher"
4. Complete checkout
5. Check database: Subscription should be updated
6. Check logs: Should see upgrade webhook processed

### Test Subscription Cancellation

1. User has active subscription
2. Go to subscription management page
3. Click "Cancel Subscription"
4. Check database: Subscription status should be "Canceled"
5. Check Stripe Dashboard: `cancel_at_period_end` should be true

## Debugging

### Check Webhook Logs

Stripe CLI shows all webhook events:

```bash
stripe listen --forward-to http://localhost:3000/api/webhook/stripe --print-json
```

### Check Application Logs

Your Next.js app will log webhook processing:

```bash
# In your terminal running `npm run dev`
# Look for webhook-related logs
```

### Common Issues

1. **Webhook signature verification failed**
   - Make sure `STRIPE_WEBHOOK_SECRET` in `.env.local` matches the one from `stripe listen`
   - Restart your dev server after updating `.env.local`

2. **Webhook not received**
   - Make sure `stripe listen` is running
   - Check that your dev server is running on port 3000
   - Verify the endpoint URL is correct

3. **Database errors**
   - Make sure your database is running
   - Check that Prisma migrations are applied
   - Verify database connection string in `.env.local`

## Stripe Test Cards

Use these test cards for different scenarios:

| Card Number | Scenario |
|------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

## Production Webhook Setup

For production, you'll need to:

1. Create a webhook endpoint in Stripe Dashboard
2. Point it to: `https://yourdomain.com/api/webhook/stripe`
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret to production environment variables

## Additional Resources

- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing Webhooks Locally](https://stripe.com/docs/stripe-cli/webhooks)

