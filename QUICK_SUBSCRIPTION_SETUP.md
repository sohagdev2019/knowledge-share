# Quick Subscription Setup Guide

## 1. Database Migration

Run the Prisma migration to add Organization and Subscription tables:

```bash
npx prisma migrate dev --name add_org_subscriptions
```

## 2. Stripe Setup

### Create Products in Stripe Dashboard

1. Go to Stripe Dashboard → Products
2. Create 3 products:
   - **Personal** (description: "1 instructor, 300 students, 20 courses")
   - **Team** (description: "10 instructors, 5000 students, 200 courses")
   - **Enterprise** (description: "Unlimited everything, SSO")

### Create Prices

For each product, create:
- Monthly recurring price
- Yearly recurring price

Copy the Price IDs (they start with `price_...`)

### Add to Environment

Add to your `.env.local`:

```env
STRIPE_PRICE_PERSONAL_MONTHLY=price_xxxxx
STRIPE_PRICE_PERSONAL_YEARLY=price_xxxxx
STRIPE_PRICE_TEAM_MONTHLY=price_xxxxx
STRIPE_PRICE_TEAM_YEARLY=price_xxxxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxxxx
STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxxxx
```

## 3. Webhook Setup

### Local Development

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

Copy the webhook signing secret and add to `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Production

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhook/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret to your production environment

## 4. Test Subscription Flow

### Create Checkout Session

```typescript
import { createSubscriptionCheckout } from "@/lib/subscription-checkout";

// In your API route or server action
const { url } = await createSubscriptionCheckout(
  userId,      // Current user ID
  "TEAM",      // Plan code: PERSONAL, TEAM, or ENTERPRISE
  "monthly"    // Billing cycle: "monthly" or "yearly"
);

// Redirect user to url
redirect(url);
```

### Check Subscription in Code

```typescript
import { checkFeature, checkLimit } from "@/lib/subscription-enforcement";

// Before allowing team role assignment
const featureCheck = await checkFeature(orgId, "team_roles");
if (!featureCheck.allowed) {
  return { error: "Upgrade to TEAM plan required" };
}

// Before creating a course
const currentCourses = await getCurrentUsage(orgId, "max_courses");
const limitCheck = await checkLimit(orgId, "max_courses", currentCourses + 1);
if (!limitCheck.allowed) {
  return { error: "Course limit exceeded" };
}
```

## 5. Customize Limits

Edit `lib/subscription-entitlements.ts` to adjust limits for your LMS:

```typescript
PERSONAL: {
  limits: {
    max_instructors: 1,
    max_students: 300,      // Adjust as needed
    max_courses: 20,        // Adjust as needed
    storage_gb: 50,
    emails_per_month: 5000,
  },
},
```

## 6. Implementation Checklist

- [ ] Run Prisma migration
- [ ] Create Stripe products and prices
- [ ] Add price IDs to `.env.local`
- [ ] Test webhook locally with Stripe CLI
- [ ] Add `checkFeature()` to protected routes
- [ ] Add `checkLimit()` before creating resources
- [ ] Add `incrementUsage()` after successful operations
- [ ] Customize grace period logic if needed
- [ ] Set up production webhook endpoint

## Common Issues

### Webhook not receiving events
- Check webhook secret is correct
- Verify endpoint URL is accessible
- Check Stripe Dashboard → Webhooks → Events for errors

### Plan code not mapping
- Verify price IDs in `.env.local` match Stripe Dashboard
- Check `mapPriceIdToPlanCode()` function

### Organization not found
- Organization is auto-created on first subscription
- Use `getOrCreateOrganization(userId)` if needed

