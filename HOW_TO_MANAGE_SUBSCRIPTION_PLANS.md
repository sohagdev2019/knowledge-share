# How to Manage Subscription Plan Data

Since we're using a **webhook-only approach**, subscription plans are defined in **code** (not in the database). This guide shows you how to add, modify, and manage subscription plan data.

## 📍 Where Plan Data Lives

All subscription plan entitlements are defined in:
**`lib/subscription-entitlements.ts`**

This file contains:
- Plan features (certificates, downloads, team_roles, sso, api_access)
- Plan limits (max_instructors, max_students, max_courses, storage_gb, emails_per_month)

## 🔧 How to Add/Modify Plans

### Option 1: Edit the Entitlements File Directly

Edit `lib/subscription-entitlements.ts`:

```typescript
export const PLAN_ENTITLEMENTS = {
  PERSONAL: {
    features: {
      certificates: true,
      downloads: true,
      team_roles: false,
      sso: false,
      api_access: false,
    },
    limits: {
      max_instructors: 1,
      max_students: 300,
      max_courses: 20,
      storage_gb: 50,
      emails_per_month: 5000,
    },
  },
  // Add a new plan here
  BUSINESS: {
    features: {
      certificates: true,
      downloads: true,
      team_roles: true,
      sso: false,
      api_access: true,
    },
    limits: {
      max_instructors: 25,
      max_students: 10000,
      max_courses: 500,
      storage_gb: 1000,
      emails_per_month: 100000,
    },
  },
  TEAM: {
    // ... existing plan
  },
  ENTERPRISE: {
    // ... existing plan
  },
} as const;
```

### Option 2: Use JSON File (Recommended for Complex Plans)

Create a JSON file and import it:

1. **Create `lib/subscription-plans.json`**:

```json
{
  "PERSONAL": {
    "features": {
      "certificates": true,
      "downloads": true,
      "team_roles": false,
      "sso": false,
      "api_access": false
    },
    "limits": {
      "max_instructors": 1,
      "max_students": 300,
      "max_courses": 20,
      "storage_gb": 50,
      "emails_per_month": 5000
    }
  },
  "TEAM": {
    "features": {
      "certificates": true,
      "downloads": true,
      "team_roles": true,
      "sso": false,
      "api_access": true
    },
    "limits": {
      "max_instructors": 10,
      "max_students": 5000,
      "max_courses": 200,
      "storage_gb": 500,
      "emails_per_month": 50000
    }
  },
  "ENTERPRISE": {
    "features": {
      "certificates": true,
      "downloads": true,
      "team_roles": true,
      "sso": true,
      "api_access": true
    },
    "limits": {
      "max_instructors": 9999,
      "max_students": 999999,
      "max_courses": 999999,
      "storage_gb": 9999,
      "emails_per_month": 999999
    }
  }
}
```

2. **Update `lib/subscription-entitlements.ts`** to import from JSON:

```typescript
import "server-only";
import plansData from "./subscription-plans.json";

export const PLAN_ENTITLEMENTS = plansData as const;
// ... rest of the file
```

## 📝 Step-by-Step: Adding a New Plan

### 1. Add Plan to Entitlements

Edit `lib/subscription-entitlements.ts`:

```typescript
export const PLAN_ENTITLEMENTS = {
  // ... existing plans
  PRO: {  // New plan
    features: {
      certificates: true,
      downloads: true,
      team_roles: false,
      sso: false,
      api_access: true,
    },
    limits: {
      max_instructors: 5,
      max_students: 1000,
      max_courses: 100,
      storage_gb: 200,
      emails_per_month: 20000,
    },
  },
} as const;
```

### 2. Add Stripe Price IDs

Add to `.env.local`:

```env
STRIPE_PRICE_PRO_MONTHLY=price_xxxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxxx
```

### 3. Update Environment Schema

Update `lib/env.ts`:

```typescript
STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
STRIPE_PRICE_PRO_YEARLY: z.string().optional(),
```

### 4. Create Stripe Products/Prices

1. Go to Stripe Dashboard → Products
2. Create "Pro" product
3. Create monthly and yearly prices
4. Copy price IDs to `.env.local`

### 5. Update Price Mapping

The `mapPriceIdToPlanCode()` function in `lib/subscription-utils.ts` will automatically work if you:
- Use the naming convention: `STRIPE_PRICE_{PLAN}_{BILLING_CYCLE}`
- The function reads from `env` automatically

## 🔄 Modifying Existing Plans

### Change Limits

Edit the `limits` object in `lib/subscription-entitlements.ts`:

```typescript
PERSONAL: {
  limits: {
    max_instructors: 1,
    max_students: 500,  // Changed from 300
    max_courses: 30,    // Changed from 20
    // ...
  },
},
```

### Change Features

Edit the `features` object:

```typescript
PERSONAL: {
  features: {
    certificates: true,
    downloads: true,
    team_roles: false,
    sso: false,
    api_access: true,  // Changed from false
  },
},
```

## 📤 Export/Import Plan Data

### Export Current Plans to JSON

Create a script `scripts/export-plans.ts`:

```typescript
import { PLAN_ENTITLEMENTS } from "../lib/subscription-entitlements";
import { writeFileSync } from "fs";

const json = JSON.stringify(PLAN_ENTITLEMENTS, null, 2);
writeFileSync("subscription-plans-export.json", json);
console.log("Plans exported to subscription-plans-export.json");
```

Run: `npx tsx scripts/export-plans.ts`

### Import Plans from JSON

1. Create/update `lib/subscription-plans.json` with your plan data
2. Update `lib/subscription-entitlements.ts` to import from JSON (see Option 2 above)

## 🎯 Example: Complete Plan Structure

```typescript
export const PLAN_ENTITLEMENTS = {
  PERSONAL: {
    features: {
      certificates: true,      // Can issue certificates
      downloads: true,        // Can download course materials
      team_roles: false,      // No team role management
      sso: false,            // No SSO
      api_access: false,      // No API access
    },
    limits: {
      max_instructors: 1,     // 1 instructor max
      max_students: 300,        // 300 students max
      max_courses: 20,          // 20 courses max
      storage_gb: 50,           // 50GB storage
      emails_per_month: 5000,    // 5000 emails/month
    },
  },
  // ... other plans
} as const;
```

## ✅ Checklist for Adding a New Plan

- [ ] Add plan to `PLAN_ENTITLEMENTS` in `lib/subscription-entitlements.ts`
- [ ] Add Stripe price ID environment variables to `.env.local`
- [ ] Update `lib/env.ts` with new environment variables
- [ ] Create Stripe product and prices in Stripe Dashboard
- [ ] Test plan mapping with `mapPriceIdToPlanCode()`
- [ ] Test checkout flow with new plan
- [ ] Test webhook handling for new plan
- [ ] Update any pricing page UI to show new plan

## 🔍 Verifying Plan Data

### Check Plan Entitlements

```typescript
import { getPlanEntitlements } from "@/lib/subscription-entitlements";

const personalPlan = getPlanEntitlements("PERSONAL");
console.log(personalPlan);
// Output: { features: {...}, limits: {...} }
```

### Check Feature Access

```typescript
import { hasFeature } from "@/lib/subscription-entitlements";

const hasSSO = hasFeature("ENTERPRISE", "sso");
// Returns: true
```

### Check Limits

```typescript
import { getLimit } from "@/lib/subscription-entitlements";

const maxStudents = getLimit("PERSONAL", "max_students");
// Returns: 300
```

## 📚 Related Files

- **`lib/subscription-entitlements.ts`** - Plan definitions
- **`lib/subscription-utils.ts`** - Price ID mapping
- **`lib/subscription-enforcement.ts`** - Feature/limit checking
- **`lib/subscription-checkout.ts`** - Checkout session creation
- **`.env.local`** - Stripe price IDs

## 🚨 Important Notes

1. **No Database Changes Needed**: Plans are in code, not database
2. **Version Control**: All plan changes are tracked in git
3. **No Admin UI**: Plans are managed through code changes
4. **Stripe Sync**: Make sure Stripe products match your plan codes
5. **Unlimited Values**: Use `9999` or higher to indicate "unlimited"

## 💡 Tips

- Use TypeScript's `as const` to ensure type safety
- Test plan changes in development before deploying
- Keep Stripe product names matching plan codes for clarity
- Document any custom limits or features in code comments
- Use JSON file for complex plans with many features

