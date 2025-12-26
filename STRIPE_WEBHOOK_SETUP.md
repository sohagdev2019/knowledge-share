# Stripe Webhook Setup Guide

## ✅ Webhook Handler Already Implemented

Your webhook handler is already set up at: `/app/api/webhook/stripe/route.ts`

It handles the following events:
- ✅ `checkout.session.completed` - Creates subscription when user completes checkout
- ✅ `customer.subscription.updated` - Updates subscription status (upgrades, downgrades, cancellations)
- ✅ `customer.subscription.deleted` - Marks subscription as expired when deleted
- ✅ `invoice.payment_succeeded` - Handles successful subscription renewals
- ✅ `invoice.payment_failed` - Handles failed payment attempts

## 🔧 Setup Steps

### 1. Get Your Webhook Endpoint URL

Your webhook endpoint will be:
- **Development**: `http://localhost:3000/api/webhook/stripe` (use Stripe CLI - see below)
- **Production**: `https://yourdomain.com/api/webhook/stripe`

### 2. Set Up Webhook in Stripe Dashboard

#### Option A: Using Stripe Dashboard (Production)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter your webhook URL: `https://yourdomain.com/api/webhook/stripe`
4. Select these events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Add it to your `.env.local` file:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

#### Option B: Using Stripe CLI (Development/Local Testing)

1. **Install Stripe CLI**:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows (using Scoop)
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe
   
   # Linux
   # Download from: https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook/stripe
   ```

4. **Copy the webhook signing secret** (shown in terminal, starts with `whsec_...`)

5. **Add to `.env.local`**:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### 3. Test Your Webhook

#### Using Stripe CLI:
```bash
# Test checkout.session.completed event
stripe trigger checkout.session.completed

# Test subscription.updated event
stripe trigger customer.subscription.updated

# Test invoice.payment_succeeded event
stripe trigger invoice.payment_succeeded
```

#### Using Stripe Dashboard:
1. Go to **Developers** → **Webhooks** → Your endpoint
2. Click **"Send test webhook"**
3. Select an event type and click **"Send test webhook"**

### 4. Verify Webhook is Working

Check your server logs for:
- ✅ `"Subscription created successfully"` - When checkout completes
- ✅ `"Subscription updated"` - When subscription changes
- ✅ `"Invoice payment succeeded"` - When renewal succeeds

## 🔒 Security Notes

- **Never commit** `STRIPE_WEBHOOK_SECRET` to git
- The webhook handler verifies the signature from Stripe
- Only requests with valid signatures are processed
- Invalid signatures return `400 Bad Request`

## 🐛 Troubleshooting

### Webhook not receiving events?
1. Check that `STRIPE_WEBHOOK_SECRET` is set in `.env.local`
2. Verify the webhook URL is correct in Stripe Dashboard
3. Check that your server is accessible (for production)
4. For local development, ensure Stripe CLI is running

### Webhook returns 400/401?
1. Verify `STRIPE_WEBHOOK_SECRET` matches the one in Stripe Dashboard
2. Check that the webhook endpoint URL is correct
3. Ensure your server is running and accessible

### Events not being processed?
1. Check server logs for error messages
2. Verify the event types are selected in Stripe Dashboard
3. Check database connection is working
4. Verify subscription plans exist in database

## 📝 Required Environment Variables

Make sure these are in your `.env.local`:

```env
# Stripe API Key
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx  # or sk_live_... for production

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Your app URL (for redirects)
NEXTAUTH_URL=http://localhost:3000  # or https://yourdomain.com for production

# Stripe Price IDs (from your subscription plans)
STRIPE_PRICE_PERSONAL_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_TEAM_MONTHLY=price_xxxxxxxxxxxxx
```

## 🚀 Production Checklist

- [ ] Webhook endpoint added in Stripe Dashboard
- [ ] All required events selected
- [ ] `STRIPE_WEBHOOK_SECRET` added to production environment
- [ ] Webhook URL uses HTTPS (required for production)
- [ ] Test webhook events are working
- [ ] Monitor webhook logs in Stripe Dashboard

## 📚 Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks Locally](https://stripe.com/docs/stripe-cli/webhooks)

