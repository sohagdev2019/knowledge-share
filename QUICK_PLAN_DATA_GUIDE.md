# Quick Guide: Adding Subscription Plan Data

## 🚀 Quick Start

### Method 1: Direct Edit (Simplest)

1. **Open** `lib/subscription-entitlements.ts`

2. **Add or modify a plan**:

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
  // Add your new plan here
  PRO: {
    features: {
      certificates: true,
      downloads: true,
      team_roles: true,
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

3. **Save the file** - That's it! ✅

### Method 2: Using JSON File

1. **Create** `lib/subscription-plans.json`:

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
  }
}
```

2. **Update** `lib/subscription-entitlements.ts`:

```typescript
import "server-only";
import plansData from "./subscription-plans.json";

export const PLAN_ENTITLEMENTS = plansData as const;
// ... rest of the file
```

## 📋 Plan Structure Template

Copy this template to add a new plan:

```typescript
YOUR_PLAN_NAME: {
  features: {
    certificates: true,    // Can issue certificates
    downloads: true,      // Can download materials
    team_roles: false,    // Team role management
    sso: false,          // Single Sign-On
    api_access: false,   // API access
  },
  limits: {
    max_instructors: 1,   // Number of instructors
    max_students: 100,    // Number of students
    max_courses: 10,      // Number of courses
    storage_gb: 10,      // Storage in GB
    emails_per_month: 1000, // Emails per month
  },
},
```

## 🔧 Common Operations

### View Current Plans

```bash
npx tsx scripts/manage-subscription-plans.ts show
```

### Export Plans to JSON

```bash
npx tsx scripts/manage-subscription-plans.ts export
```

This creates `subscription-plans-export.json` that you can edit.

### Validate Plans

```bash
npx tsx scripts/manage-subscription-plans.ts validate
```

## 📝 Example: Adding a "Starter" Plan

1. **Edit** `lib/subscription-entitlements.ts`:

```typescript
export const PLAN_ENTITLEMENTS = {
  // ... existing plans
  STARTER: {
    features: {
      certificates: false,
      downloads: false,
      team_roles: false,
      sso: false,
      api_access: false,
    },
    limits: {
      max_instructors: 1,
      max_students: 50,
      max_courses: 5,
      storage_gb: 10,
      emails_per_month: 1000,
    },
  },
} as const;
```

2. **Add Stripe Price IDs** to `.env.local`:

```env
STRIPE_PRICE_STARTER_MONTHLY=price_xxxxx
STRIPE_PRICE_STARTER_YEARLY=price_xxxxx
```

3. **Update** `lib/env.ts`:

```typescript
STRIPE_PRICE_STARTER_MONTHLY: z.string().optional(),
STRIPE_PRICE_STARTER_YEARLY: z.string().optional(),
```

4. **Create Stripe product** in Stripe Dashboard

5. **Done!** ✅

## 🎯 Key Points

- ✅ Plans are defined in **code** (version controlled)
- ✅ No database changes needed
- ✅ No admin UI needed
- ✅ Changes take effect immediately after deployment
- ✅ Use `9999` or higher for "unlimited" values

## 📚 Full Documentation

See `HOW_TO_MANAGE_SUBSCRIPTION_PLANS.md` for complete details.

