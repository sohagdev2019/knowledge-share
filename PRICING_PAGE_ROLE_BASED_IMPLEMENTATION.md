# Pricing Page - Role-Based Dynamic Content Implementation

## Overview

The `/pricing` page now shows dynamic content based on user login state and role, without redirecting users away. Everyone can visit the page, but the content and available actions change based on their role.

## Implementation Summary

### ✅ Key Features

1. **No Redirects** - All users can access `/pricing` page
2. **Dynamic Content** - Plans shown based on role and login state
3. **Role Switcher Tabs** - For guests and SuperAdmins to switch between Student/Teacher plans
4. **Smart Button States** - Buttons adapt based on role and login state
5. **Plan Filtering** - Automatically filters plans based on user role

## Role-Based Behavior

### 🔓 Guest (Not Logged In)

**What They See:**
- ✅ Student subscription plans
- ✅ Teacher subscription plans
- Role switcher tabs (Student | Teacher)

**Actions:**
- "Login to Subscribe" button → redirects to `/login` with redirect parameter
- Can switch between Student and Teacher tabs to compare plans

**Goal:** Marketing + conversion, let visitors compare both roles

### 🔐 User (Student) - Logged In

**What They See:**
- ✅ Student subscription plans only
- ❌ Teacher subscription plans (hidden)
- No role switcher (locked to Student view)

**Actions:**
- "Get Started" / "Subscribe Now" → enabled
- "Upgrade / Downgrade" → visible if already subscribed
- Can manage their subscription

**UX:** Clean, focused UI with no confusion from creator plans

### 🔐 Admin (Teacher) - Logged In

**What They See:**
- ✅ Teacher (Admin) subscription plans only
- ❌ Student subscription plans (hidden)
- No role switcher (locked to Teacher view)

**Actions:**
- "Subscribe as Teacher" → enabled
- "Upgrade Plan" → shown if limit reached

**UX Message:** "Teacher plans are designed for course creators."

### 🔐 Super Admin - Logged In

**What They See:**
- ✅ Student plans
- ✅ Teacher plans
- Role switcher tabs (Student | Teacher | All)

**Actions:**
- ❌ All "Subscribe" buttons disabled
- Badge/tooltip: "Super Admin accounts don't need subscriptions."
- Button shows: "Not Required" with lock icon

**Important:** No redirect, no checkout access, but can view all plans

## UI Components

### Role Switcher Tabs

**Visibility:**
- Shown for: Guests and SuperAdmins
- Hidden for: Regular Users and Admins (locked to their role)

**Tabs:**
- **Student** - Shows student/user plans
- **Teacher** - Shows teacher/admin plans  
- **All** - Only visible for SuperAdmin, shows all plans

**Behavior:**
- Smooth tab switching with animations
- Tabs are locked for logged-in users (except SuperAdmin)
- Default tab based on user role

### Pricing Cards

**Design:**
- Rounded corners, soft shadows
- Highlight "Most Popular" plans
- Subtle hover animations
- Smooth scale-in on load

**Content:**
- Plan name
- Price (monthly/yearly)
- Feature list
- Usage limits
- CTA button (role-aware)

### Button States

| Role | Button State | Label | Action |
|------|-------------|-------|--------|
| Guest | Enabled | "Login to Subscribe" | Redirect to login |
| User | Enabled | "Get Started" / "Subscribe Now" | Go to checkout |
| Admin | Enabled | "Subscribe as Teacher" | Go to checkout (teacher plans only) |
| SuperAdmin | Disabled | "Not Required" | No action (tooltip shown) |

**Disabled Button UX (SuperAdmin):**
- Greyed out button
- Lock icon
- Tooltip on hover: "Super Admin accounts don't need subscriptions."

## Plan Filtering Logic

### Helper Functions (`lib/plan-utils.ts`)

1. **`isAdminPlan(plan)`** - Determines if a plan is for admins/teachers
   - Checks plan name, slug, and planType for keywords: "admin", "teacher", "creator", "instructor", "educator"

2. **`filterPlansByRole(plans, role)`** - Filters plans by role type
   - `"student"` - Returns only student plans
   - `"teacher"` - Returns only teacher plans
   - `"all"` - Returns all plans

### Filtering Rules

- **Guest:** Shows plans based on selected tab (Student/Teacher)
- **User:** Only shows student plans (filtered automatically)
- **Admin:** Only shows teacher plans (filtered automatically)
- **SuperAdmin:** Shows plans based on selected tab (Student/Teacher/All)

## Files Modified/Created

### New Files
1. `lib/plan-utils.ts` - Plan filtering utilities
2. `PRICING_PAGE_ROLE_BASED_IMPLEMENTATION.md` - This documentation

### Modified Files
1. `app/(public)/pricing/page.tsx` - Removed redirects, added role props
2. `app/(public)/pricing/_components/PricingPlans.tsx` - Added role-based filtering, tabs, and button states
3. `app/(public)/pricing/actions.ts` - Still has role checks (prevents wrong plan subscription)
4. `app/(public)/checkout/actions.ts` - Still has role checks (prevents wrong plan checkout)

## Security & Validation

### Server-Side Protection

Even though the UI shows/hides plans, server-side validation still prevents:
- Admins from subscribing to user plans
- Users from subscribing to admin plans
- SuperAdmins from creating subscriptions

**Checkout Protection:**
- `createSubscriptionCheckout()` - Validates role before creating checkout
- `upgradeSubscription()` - Validates role before upgrading
- `cancelSubscription()` - Validates role before canceling

## Animations & UX

### Recommended Animations
- ✅ Fade + slide up for cards (implemented)
- ✅ Smooth tab switching (implemented)
- ✅ Hover lift on cards (implemented)
- ✅ Button ripple/glow effect (implemented)
- ✅ Animated pricing toggle (existing)

### Motion Rules
- Fast but soft (200–300ms)
- Ease-in-out transitions
- No jarring movement

### Color & Theme
- Student plans → Blue/Green tones
- Teacher plans → Purple/Orange tones
- SuperAdmin → Neutral/Grey accents

### Icons
- 🎓 Students (GraduationCap)
- 🧑‍🏫 Teachers (UserCog)
- 👑 SuperAdmin (Shield)

## Messaging

### Header Text
- **Default:** "Simple, transparent pricing"
- **Guest:** "Whether you're learning or teaching, we've got a plan for you."
- **User:** "Start free with limited courses. Scale as you grow and unlock unlimited learning."
- **Admin:** "Teacher plans are designed for course creators."
- **SuperAdmin:** "Choose the plan that fits your needs."

## Testing Checklist

- [ ] Guest can see both Student and Teacher plans
- [ ] Guest can switch between tabs
- [ ] Guest "Login to Subscribe" redirects to login
- [ ] User only sees Student plans
- [ ] User cannot see Teacher plans
- [ ] User can subscribe to Student plans
- [ ] Admin only sees Teacher plans
- [ ] Admin cannot see Student plans
- [ ] Admin can subscribe to Teacher plans
- [ ] SuperAdmin sees all plans
- [ ] SuperAdmin can switch between tabs
- [ ] SuperAdmin buttons are disabled
- [ ] SuperAdmin tooltip shows on hover
- [ ] Server-side validation prevents wrong plan subscriptions
- [ ] Animations are smooth
- [ ] Tabs work correctly
- [ ] Button states are correct for each role

## Key Benefits

✅ **No forced redirects** - Better UX, users stay on page
✅ **Clean & intuitive** - Role-aware experience
✅ **One pricing page** - Easier to maintain
✅ **Future-proof** - Easy to add new roles
✅ **Marketing friendly** - Guests can compare all plans
✅ **Secure** - Server-side validation still in place

## Notes

- Plan identification uses naming convention (keywords in name/slug/planType)
- For production, consider adding a `planCategory` field to SubscriptionPlan model for more reliable filtering
- Tabs are client-side state, but filtering respects server-side role checks
- All subscription actions still validate roles server-side for security

