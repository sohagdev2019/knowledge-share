# Role-Based Subscription System Implementation

## Overview

This document describes the implementation of a comprehensive role-based subscription system that enforces different subscription rules based on user roles (User, Admin, SuperAdmin).

## Implementation Summary

### ✅ Completed Features

1. **Role-Based Access Control Utilities** (`lib/role-access.ts`)
   - `getUserRole()` - Get current user role from session
   - `requireRole()` - Require specific role(s) with redirect
   - `canAccessPricing()` - Check if user can access pricing page
   - `canSubscribeToUserPlans()` - Check if user can subscribe to user plans
   - `requiresSubscription()` - Check if user requires subscription
   - `isAdmin()` / `isSuperAdmin()` - Role check helpers
   - `getRoleBasedRedirect()` - Get appropriate redirect URL based on role

2. **Pricing Page Protection** (`app/(public)/pricing/page.tsx`)
   - ✅ Blocks Admin and SuperAdmin from accessing `/pricing`
   - ✅ Redirects to appropriate dashboard based on role
   - ✅ Allows regular users and unauthenticated users to view pricing

3. **Checkout Page Protection** (`app/(public)/checkout/page.tsx`)
   - ✅ Blocks Admin and SuperAdmin from checkout flow
   - ✅ Redirects to appropriate dashboard

4. **Subscription Actions Protection**
   - ✅ `cancelSubscription()` - Blocks admin from canceling user subscriptions
   - ✅ `upgradeSubscription()` - Blocks admin from upgrading to user plans
   - ✅ `createSubscriptionCheckout()` - Blocks admin from creating checkout sessions

5. **Access Denied Page** (`app/access-denied/page.tsx`)
   - ✅ Custom error page with role-specific messages
   - ✅ Redirects to appropriate dashboard
   - ✅ Clear messaging for each role

## Role Rules

### 1️⃣ User (Student / Regular User)

**Access:**
- ✅ Can access `/pricing` page
- ✅ Can subscribe to current plans
- ✅ Can access subscription checkout
- ✅ Can manage their subscriptions (upgrade/downgrade/cancel)

**Blocked:**
- ❌ Cannot upload courses
- ❌ Cannot access admin dashboard
- ❌ Cannot access super admin panel

**Subscription:**
- ✅ Subscription required to access premium content
- ✅ Can subscribe to Personal, Team, or Enterprise plans

### 2️⃣ Admin (Teacher / Course Creator)

**Access:**
- ✅ Can upload and manage courses
- ✅ Can access admin dashboard
- ✅ Can manage students

**Blocked:**
- ❌ Cannot access `/pricing` page (redirected to admin dashboard)
- ❌ Cannot subscribe to user plans
- ❌ Cannot access subscription checkout
- ❌ Cannot access super admin panel

**Subscription:**
- 🔒 Requires a different subscription plan (Admin Plan / Creator Plan)
- ⚠️ **Note:** Admin plan structure needs to be implemented separately

**UX Behavior:**
- When trying to access pricing: Redirected to `/admin` with message
- Error message: "Admin accounts require a different subscription plan."

### 3️⃣ Super Admin (Platform Owner)

**Access:**
- ✅ Full access to all dashboards
- ✅ All users & subscriptions management
- ✅ System configuration

**Blocked:**
- ❌ Cannot access `/pricing` page (redirected to super admin panel)
- ❌ Cannot subscribe to any plan
- ❌ No subscription UI visible anywhere

**Subscription:**
- ❌ No subscription required
- ✅ Full access always

**UX Behavior:**
- When trying to access pricing: Redirected to `/superadmin`
- No subscription limitations

## Route Protection Matrix

| Route | User | Admin | SuperAdmin |
|-------|------|-------|------------|
| `/pricing` | ✅ Yes | ❌ No (redirect) | ❌ No (redirect) |
| `/checkout` | ✅ Yes | ❌ No (redirect) | ❌ No (redirect) |
| `/dashboard` | ✅ Yes | ❌ No | ❌ No |
| `/admin` | ❌ No | ✅ Yes | ❌ No |
| `/superadmin` | ❌ No | ❌ No | ✅ Yes |

## Files Modified/Created

### New Files
1. `lib/role-access.ts` - Role-based access control utilities
2. `app/access-denied/page.tsx` - Access denied page with role-specific messages

### Modified Files
1. `app/(public)/pricing/page.tsx` - Added role check and redirect
2. `app/(public)/pricing/actions.ts` - Added role checks to subscription actions
3. `app/(public)/checkout/page.tsx` - Added role check and redirect
4. `app/(public)/checkout/actions.ts` - Added role check to checkout creation

## Subscription Lifecycle Rules

### Upgrade Rules
- **User Subscription Upgrade**: Instant upgrade, user pays price difference
- **Admin Subscription Upgrade**: Not applicable (admins use different plans)

### Downgrade Rules
- **User Subscription Downgrade**: Applies at next billing cycle
- **Admin Subscription Downgrade**: Not applicable

### Cancellation Rules
- **User Subscription Cancellation**: 
  - Stops auto-renewal
  - Subscription remains active until billing end
  - No immediate access loss
- **Admin Subscription Cancellation**: Not applicable (different system)
- **Super Admin**: Cannot cancel (no subscription)

### Super Admin Rules
- ❌ Cannot upgrade
- ❌ Cannot downgrade
- ❌ Cannot cancel
- ❌ Cannot access pricing
- ✅ Full access always

## Error Messages

### Admin Accessing Pricing
```
"Admin accounts require a different subscription plan. 
User pricing plans are not available for admin accounts."
```

### Super Admin Accessing Pricing
```
"Super Admin accounts do not require subscriptions. 
This page is not accessible for Super Admin users."
```

### Admin Trying to Subscribe
```
"Admin accounts cannot subscribe to user plans. 
Admin accounts require a different subscription plan."
```

## Next Steps (Future Implementation)

### Admin Subscription Plans
The following needs to be implemented separately:

1. **Admin Plan Structure**
   - Starter Admin Plan (limited courses, students, basic analytics)
   - Pro Admin Plan (more courses, students, advanced analytics)
   - Enterprise Admin Plan (unlimited, multiple admins, custom branding)

2. **Admin Plan Features**
   - Number of courses limit
   - Number of students limit
   - Storage (videos/files) limit
   - Advanced features access
   - Support level

3. **Admin Subscription Management**
   - Separate admin subscription checkout flow
   - Admin subscription management page
   - Usage tracking and limits
   - Upgrade prompts when limits reached

### Database Schema Updates
- Add `planType` field to distinguish user plans from admin plans
- Or create separate `AdminSubscriptionPlan` model
- Add usage tracking tables for admin limits

## Testing Checklist

- [ ] User can access pricing page
- [ ] User can subscribe to plans
- [ ] Admin is redirected from pricing page
- [ ] Admin cannot access checkout
- [ ] SuperAdmin is redirected from pricing page
- [ ] SuperAdmin cannot access checkout
- [ ] Access denied page shows correct message for each role
- [ ] Subscription actions block admin users
- [ ] Error messages are clear and helpful

## Notes

- The middleware is lightweight and doesn't handle role checks (handled at page level)
- Role checks are performed server-side for security
- All subscription actions validate user role before processing
- SuperAdmin never requires subscription checks (always has access)

