# 🆓 How to Add Free Plan

This guide shows you exactly how to create the Free subscription plan.

---

## 🚀 Step-by-Step Instructions

### Step 1: Navigate to Subscription Plans

1. **Log in as Superadmin**
   - Make sure you're logged in with superadmin account

2. **Go to Subscription Plans Page**
   - Click "Subscription Plans" in the sidebar
   - Or go to: `/superadmin/subscription-plans`

3. **Click "Create Plan" Button**
   - You'll see a button with "+" icon at the top right
   - Click **"Create Plan"**

---

### Step 2: Fill in Basic Information

#### **Plan Name**
```
Free
```

#### **Slug**
- Click the **"Generate"** button next to the slug field
- Or manually enter: `free`
- The slug will auto-generate from the name

#### **Description**
```
Perfect for getting started. Access to limited courses and features.
```

---

### Step 3: Set Pricing

#### **Monthly Price (USD)**
```
0
```
- Enter: `0`
- Will show: `$0.00/month` and `৳0.00/month (BDT)`

#### **Yearly Price (USD)**
```
0
```
- Enter: `0`
- Will show: `$0.00/year` and `৳0.00/year (BDT)`

#### **Stripe Monthly Price ID**
- **Leave empty** (free plan doesn't need Stripe)

#### **Stripe Yearly Price ID**
- **Leave empty** (free plan doesn't need Stripe)

---

### Step 4: Configure Features & Limits

#### **Max Course Access**
```
3
```
- Enter: `3`
- This limits users to 3 courses

#### **Trial Days**
- Select: **"No Trial (0 days)"**
- Free plans don't need trials

#### **Feature Toggles** (All OFF)
- **Allows Downloads**: ❌ OFF
- **Allows Certificates**: ❌ OFF
- **Allows Live Classes**: ❌ OFF
- **Allows Team Access**: ❌ OFF
- **Priority Support**: ❌ OFF

#### **Team Seats**
```
1
```
- Leave as default: `1` (not applicable for free plan)

---

### Step 5: Settings

#### **Is Active**
- ✅ **ON** (Enable this so the plan appears on `/pricing` page)

#### **Is Popular**
- ❌ **OFF** (Only Pro plan should be marked as popular)

---

### Step 6: Save the Plan

1. **Scroll down** to the bottom of the form
2. **Click** "Create Subscription Plan" button
3. You'll be redirected to the plans list
4. The Free plan should now appear in your list

---

## ✅ Complete Free Plan Configuration

Here's the complete configuration summary:

```
✅ Basic Information
   Name: Free
   Slug: free
   Description: Perfect for getting started. Access to limited courses and features.

✅ Pricing
   Monthly Price (USD): 0
   Yearly Price (USD): 0
   Stripe Monthly Price ID: (leave empty)
   Stripe Yearly Price ID: (leave empty)

✅ Features & Limits
   Max Course Access: 3
   Trial Days: No Trial (0 days)
   Allows Downloads: OFF
   Allows Certificates: OFF
   Allows Live Classes: OFF
   Allows Team Access: OFF
   Team Seats: 1
   Priority Support: OFF

✅ Settings
   Is Active: ON
   Is Popular: OFF
```

---

## 🎯 Visual Guide

### Form Sections:

1. **Basic Information Section**
   - Name: `Free`
   - Slug: `free` (click Generate button)
   - Description: `Perfect for getting started...`

2. **Pricing Section**
   - Monthly: `0` USD
   - Yearly: `0` USD
   - Stripe IDs: (both empty)

3. **Features Section**
   - Max Courses: `3`
   - Trial: `0 days`
   - All toggles: OFF

4. **Settings Section**
   - Active: ON ✅
   - Popular: OFF ❌

---

## ✅ Verification

After creating the Free plan, verify:

1. **Check the Plans List**
   - Go back to `/superadmin/subscription-plans`
   - You should see "Free" in the list
   - Monthly Price: $0.00
   - Yearly Price: $0.00
   - Status: Active

2. **Check the Pricing Page**
   - Visit `/pricing`
   - Free plan should appear
   - Shows "$0/month" and "$0/year"

3. **Test User Experience**
   - Try signing up/selecting Free plan
   - Should work without payment

---

## 🆘 Troubleshooting

### "Plan not showing on /pricing page"
- ✅ Make sure "Is Active" is enabled
- ✅ Clear browser cache
- ✅ Refresh the page

### "Error: Slug already exists"
- The slug "free" might already be taken
- Try: `free-plan` or `free-tier`
- Or delete the existing plan first

### "Can't save with $0 price"
- This should work fine
- Make sure you entered `0`, not empty field
- Check that both monthly and yearly are `0`

---

## 📊 Free Plan vs Paid Plans

| Feature | Free Plan | Pro/Business Plans |
|---------|-----------|-------------------|
| **Price** | $0 | $29.99+ |
| **Course Limit** | 3 courses | Unlimited |
| **Downloads** | ❌ No | ✅ Yes |
| **Certificates** | ❌ No | ✅ Yes |
| **Live Classes** | ❌ No | ✅ Yes |
| **Trial** | No trial | 7-15 days |
| **Stripe Required** | ❌ No | ✅ Yes |

---

## 💡 Tips

1. **Free Plan Purpose**
   - Attract new users
   - Let them try limited features
   - Encourage upgrade to Pro

2. **Course Limit**
   - 3 courses is a good starting point
   - Users can access limited content
   - Encourages upgrade for more

3. **No Stripe Needed**
   - Free plans don't require payment
   - Skip Stripe Price ID fields
   - Users can subscribe without payment

4. **Always Active**
   - Keep Free plan active
   - It's your entry-level option
   - Never mark as "Most Popular" (that's for Pro)

---

## 🎉 Summary

**Quick Steps:**
1. Go to `/superadmin/subscription-plans`
2. Click "Create Plan"
3. Name: `Free`, Slug: `free`
4. Prices: Both `0`
5. Max Courses: `3`
6. All features: OFF
7. Is Active: ON
8. Save!

**That's it!** Your Free plan is ready! 🎊

---

## 📝 Next Steps

After creating the Free plan:

1. ✅ Create Pro Plan (if not already done)
2. ✅ Create Business Plan
3. ✅ Verify all 3 plans appear on `/pricing`
4. ✅ Test the subscription flow

You now have a complete subscription system! 🚀

