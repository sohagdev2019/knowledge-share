# Stripe Webhook-Only Subscription Implementation

This document describes the organization-based subscription system implemented following the webhook-only approach.

## Overview

The system implements a 3-tier subscription model (Personal/Team/Enterprise) where:
- **Stripe controls payment** - All payment processing happens via Stripe
- **Your app controls access & limits** - Entitlements are defined in code (version control)
- **Organization-based** - Subscriptions apply to Organizations, not individual users

## Architecture

### 1. Plan Entitlements (Code-Based)

Entitlements are defined in `lib/subscription-entitlements.ts`:

- **PERSONAL**: 1 instructor, 300 students, 20 courses, 50GB storage
- **TEAM**: 10 instructors, 5000 students, 200 courses, 500GB storage, team roles, API access
- **ENTERPRISE**: Unlimited everything, SSO, team roles, API access

### 2. Database Schema

New models added to `prisma/schema.prisma`:

- **Organization**: Represents an org/school with an owner
- **Subscription**: One per organization, tracks plan, status, Stripe IDs
- **UsageCounter**: Optional but professional - tracks quotas (students, courses, storage, emails)

### 3. Environment Variables

Add these to your `.env.local`:

```env
# Stripe Price IDs (get these from Stripe Dashboard after creating products)
STRIPE_PRICE_PERSONAL_MONTHLY=price_...
STRIPE_PRICE_PERSONAL_YEARLY=price_...
STRIPE_PRICE_TEAM_MONTHLY=price_...
STRIPE_PRICE_TEAM_YEARLY=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
STRIPE_PRICE_ENTERPRISE_YEARLY=price_...
```

### 4. Stripe Setup (One-Time)

In Stripe Dashboard:

1. Create 3 Products: Personal, Team, Enterprise
2. Create Price IDs (monthly/yearly) for each product
3. Add the price IDs to your `.env.local` file

## Implementation Files

### Core Files

1. **`lib/subscription-entitlements.ts`**
   - Defines plan features and limits
   - Helper functions: `hasFeature()`, `getLimit()`, `isWithinLimit()`

2. **`lib/subscription-utils.ts`**
   - Maps Stripe price IDs to plan codes
   - Organization management functions
   - `getOrCreateOrganization()` - Creates org for user

3. **`lib/subscription-enforcement.ts`**
   - `checkFeature()` - Check if org has a feature
   - `checkLimit()` - Check if org is within a limit
   - `getCurrentUsage()` - Get current usage count
   - `incrementUsage()` - Increment usage counter

4. **`lib/subscription-checkout.ts`**
   - `createSubscriptionCheckout()` - Creates Stripe checkout session
   - Handles customer creation/retrieval
   - Sets up metadata with orgId

5. **`app/api/webhook/stripe/route.ts`**
   - Updated webhook handler for org-based subscriptions
   - Handles all required events (see below)

## Webhook Events Handled

The webhook handler processes these events for org-based subscriptions:

### A) `checkout.session.completed`
- Gets `orgId` from metadata
- Saves `stripeCustomerId`, `stripeSubscriptionId`
- Maps price ID to plan code
- Creates/updates Subscription record

### B) `customer.subscription.created` / `customer.subscription.updated`
- **Source of truth** for:
  - `status` (active/trialing/past_due/canceled/incomplete/paused)
  - `current_period_start` / `current_period_end`
  - `cancel_at_period_end`
  - Plan mapping (from `price_id` → `plan_code`)

### C) `customer.subscription.deleted`
- Marks subscription as expired
- Option: Switch org to FREE/limited mode (you can implement this)

### D) `invoice.payment_succeeded` / `invoice.paid`
- Sets status to `active`
- Confirms renewals
- Updates period dates

### E) `invoice.payment_failed`
- Sets status to `past_due`
- Grace period logic (currently allows access, you can customize)

## Usage Examples

### Creating a Checkout Session

```typescript
import { createSubscriptionCheckout } from "@/lib/subscription-checkout";

const { url } = await createSubscriptionCheckout(
  userId,
  "TEAM",
  "monthly"
);

// Redirect user to url
```

### Checking Features

```typescript
import { checkFeature } from "@/lib/subscription-enforcement";

const result = await checkFeature(orgId, "team_roles");

if (!result.allowed) {
  return {
    error: result.error?.code,
    message: result.error?.message,
    planNeeded: result.error?.planNeeded,
  };
}
```

### Checking Limits

```typescript
import { checkLimit, getCurrentUsage } from "@/lib/subscription-enforcement";

const currentStudents = await getCurrentUsage(orgId, "max_students");
const result = await checkLimit(orgId, "max_students", currentStudents + 1);

if (!result.allowed) {
  return { error: "limit_exceeded", message: result.error?.message };
}
```

### Incrementing Usage

```typescript
import { incrementUsage } from "@/lib/subscription-enforcement";

// When a student enrolls
await incrementUsage(orgId, "max_students", 1);

// When sending an email
await incrementUsage(orgId, "emails_per_month", 1);
```

## Enforcement Rules

### Status Checks

- **active / trialing** → Allow all actions
- **past_due** → Allow with grace OR block premium actions (customize in `checkSubscriptionStatus()`)
- **canceled/expired** → Read-only (view content), block creation

### Feature Flags

Check before allowing actions:
- `team_roles` - Only Team+ plans
- `sso` - Only Enterprise
- `api_access` - Team+ plans

### Quota Checks

Check before creating:
- `max_students` - Before enrolling a student
- `max_courses` - Before creating a course
- `max_instructors` - Before adding an instructor
- `storage_gb` - Before uploading files
- `emails_per_month` - Before sending emails

## Grace Period (Recommended)

Currently, `past_due` subscriptions still have access. You can implement a grace period:

1. Track `past_due` date in Subscription model
2. In `checkSubscriptionStatus()`, check if grace period expired
3. Block premium actions after grace period

Example:
```typescript
// In subscription-enforcement.ts
if (status === "past_due") {
  const daysSincePastDue = calculateDaysSince(subscription.pastDueDate);
  if (daysSincePastDue > 7) {
    return { allowed: false, error: { code: "subscription_expired" } };
  }
  return { allowed: true }; // Grace period active
}
```

## Next Steps

1. **Run Prisma migration**:
   ```bash
   npx prisma migrate dev --name add_org_subscriptions
   ```

2. **Create Stripe products and prices** in Stripe Dashboard

3. **Add price IDs to `.env.local`**

4. **Test webhook** using Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook/stripe
   ```

5. **Implement enforcement** in your API routes:
   - Add `checkFeature()` before team role actions
   - Add `checkLimit()` before creating students/courses
   - Add `incrementUsage()` after successful operations

6. **Customize limits** in `lib/subscription-entitlements.ts` based on your LMS needs

## Notes

- The system maintains backward compatibility with existing user-based subscriptions
- Organization is automatically created when a user subscribes
- All plan logic is in code (no admin UI needed for plan management)
- Stripe webhook signature verification is enabled
- Grace period logic can be customized in `subscription-enforcement.ts`

