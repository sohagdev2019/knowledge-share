# 📋 Subscription Plans Setup Guide

This guide provides the exact details for creating your 3 subscription plans: **Free**, **Pro**, and **Business**.

---

## 🎯 Plan Overview

| Plan | Price | Trial | Best For |
|------|-------|-------|----------|
| **Free** | $0 | No trial | Getting started |
| **Pro** | $29.99/month | 7 days | Professionals |
| **Business** | $99.99/month | 7 days | Teams & Organizations |

---

## 📝 Plan 1: Free Plan

### Basic Information
- **Name**: `Free`
- **Slug**: `free` (auto-generated)
- **Description**: `Perfect for getting started. Access to limited courses and features.`

### Pricing
- **Monthly Price (cents)**: `0`
- **Yearly Price (cents)**: `0`
- **Stripe Monthly Price ID**: Leave empty (free plan)
- **Stripe Yearly Price ID**: Leave empty (free plan)

### Features & Limits
- **Max Course Access**: `3` (limited to 3 courses)
- **Trial Days**: `0` (no trial for free plan)
- **Allows Downloads**: ❌ Disabled
- **Allows Certificates**: ❌ Disabled
- **Allows Live Classes**: ❌ Disabled
- **Allows Team Access**: ❌ Disabled
- **Team Seats**: `1` (not applicable)
- **Priority Support**: ❌ Disabled

### Settings
- **Is Active**: ✅ Enabled
- **Is Popular**: ❌ Disabled

---

## 📝 Plan 2: Pro Plan (Already Created)

### Basic Information
- **Name**: `Pro`
- **Slug**: `pro`
- **Description**: `For professionals looking to advance their career. Full access to all courses and premium features.`

### Pricing
- **Monthly Price (cents)**: `2999` ($29.99/month)
- **Yearly Price (cents)**: `29999` ($299.99/year = $24.99/month)
- **Stripe Monthly Price ID**: `price_xxxxx` (from Stripe)
- **Stripe Yearly Price ID**: `price_xxxxx` (from Stripe)

### Features & Limits
- **Max Course Access**: Leave empty (unlimited)
- **Trial Days**: `7` days
- **Allows Downloads**: ✅ Enabled
- **Allows Certificates**: ✅ Enabled
- **Allows Live Classes**: ✅ Enabled
- **Allows Team Access**: ❌ Disabled
- **Team Seats**: `1`
- **Priority Support**: ✅ Enabled

### Settings
- **Is Active**: ✅ Enabled
- **Is Popular**: ✅ Enabled (mark as most popular)

---

## 📝 Plan 3: Business Plan

### Basic Information
- **Name**: `Business`
- **Slug**: `business` (auto-generated)
- **Description**: `Perfect for teams and organizations. Includes team collaboration, advanced analytics, and dedicated support.`

### Pricing
- **Monthly Price (cents)**: `9999` ($99.99/month)
- **Yearly Price (cents)**: `99999` ($999.99/year = $83.33/month)
- **Stripe Monthly Price ID**: `price_xxxxx` (from Stripe)
- **Stripe Yearly Price ID**: `price_xxxxx` (from Stripe)

### Features & Limits
- **Max Course Access**: Leave empty (unlimited)
- **Trial Days**: `7` days
- **Allows Downloads**: ✅ Enabled
- **Allows Certificates**: ✅ Enabled
- **Allows Live Classes**: ✅ Enabled
- **Allows Team Access**: ✅ Enabled
- **Team Seats**: `10` (includes 10 team members)
- **Priority Support**: ✅ Enabled

### Settings
- **Is Active**: ✅ Enabled
- **Is Popular**: ❌ Disabled

---

## 🚀 Step-by-Step: Creating the Plans

### Step 1: Create Free Plan

1. Go to `/superadmin/subscription-plans`
2. Click **"Create Plan"**
3. Fill in Free Plan details (see above)
4. **Important**: Set prices to `0` (cents)
5. Leave Stripe Price IDs empty (free plan)
6. Click **"Create Subscription Plan"**

### Step 2: Verify Pro Plan

1. Check if Pro Plan already exists
2. If it exists, verify all settings match the details above
3. If it doesn't exist, create it using the details above

### Step 3: Create Business Plan

1. Go to `/superadmin/subscription-plans`
2. Click **"Create Plan"**
3. Fill in Business Plan details (see above)
4. **Important**: Create Stripe Price IDs first (see below)
5. Paste Stripe Price IDs in the form
6. Click **"Create Subscription Plan"**

---

## 💳 Creating Stripe Price IDs for Business Plan

### In Stripe Dashboard:

1. **Create Product:**
   - Name: `Business Plan`
   - Description: `Team subscription plan`

2. **Add Monthly Price:**
   - Price: `99.99`
   - Billing: Recurring → Monthly
   - Currency: USD
   - **Copy Price ID**: `price_xxxxx`

3. **Add Yearly Price:**
   - Price: `999.99`
   - Billing: Recurring → Yearly
   - Currency: USD
   - **Copy Price ID**: `price_xxxxx`

4. **Paste in Form:**
   - Monthly Price ID → `stripePriceIdMonthly`
   - Yearly Price ID → `stripePriceIdYearly`

---

## 📊 Complete Plan Comparison

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| **Price/Month** | $0 | $29.99 | $99.99 |
| **Price/Year** | $0 | $299.99 | $999.99 |
| **Trial Days** | 0 | 7 | 7 |
| **Course Access** | 3 courses | Unlimited | Unlimited |
| **Downloads** | ❌ | ✅ | ✅ |
| **Certificates** | ❌ | ✅ | ✅ |
| **Live Classes** | ❌ | ✅ | ✅ |
| **Team Access** | ❌ | ❌ | ✅ |
| **Team Seats** | 1 | 1 | 10 |
| **Priority Support** | ❌ | ✅ | ✅ |

---

## ✅ Verification Checklist

After creating all plans:

- [ ] Free Plan created with $0 pricing
- [ ] Pro Plan exists and configured correctly
- [ ] Business Plan created with $99.99/month pricing
- [ ] All plans have "Is Active" enabled
- [ ] Only Pro Plan has "Is Popular" enabled
- [ ] Pro and Business have 7-day trials
- [ ] Stripe Price IDs added for Pro and Business
- [ ] All plans appear on `/pricing` page

---

## 🎨 Trial Days Options

The form now includes a dropdown for trial days with these options:
- **No Trial (0 days)** - For free plans
- **7 Days** - Default for paid plans
- **10 Days** - Optional longer trial
- **15 Days** - Extended trial period

You can select any of these when creating or editing plans.

---

## 💡 Tips

1. **Free Plan**: No Stripe integration needed (it's free!)
2. **Pro Plan**: Should be marked as "Most Popular" for best conversion
3. **Business Plan**: Highlight team features in description
4. **Trial Days**: 7 days is standard, but you can offer 10 or 15 for promotions
5. **Pricing**: Yearly plans should offer 10-15% discount vs monthly

---

## 🆘 Troubleshooting

### "Free plan showing as paid"
- Check that both monthly and yearly prices are `0` (not empty)

### "Trial not working"
- Verify trial days are set (7, 10, or 15)
- Check Stripe subscription settings

### "Plan not showing on /pricing"
- Make sure "Is Active" is enabled
- Clear cache and refresh

---

## Summary

You now have:
- ✅ **Free Plan**: $0, 3 courses, basic features
- ✅ **Pro Plan**: $29.99/month, unlimited, 7-day trial, most popular
- ✅ **Business Plan**: $99.99/month, team features, 7-day trial

All plans are ready to go! 🎉

