# 📋 How to Create New Subscription Plans

This guide will walk you through creating subscription plans from the superadmin dashboard.

---

## 🚀 Quick Steps

### Step 1: Navigate to Subscription Plans

1. **Log in as Superadmin**
   - Make sure you're logged in with a superadmin account

2. **Go to Superadmin Dashboard**
   - Click on your profile dropdown (top right)
   - Select "Dashboard" 
   - Or navigate to `/superadmin` directly

3. **Open Subscription Plans**
   - In the sidebar, find **"Subscription Plans"** (with receipt icon)
   - Click on it, or navigate to `/superadmin/subscription-plans`

### Step 2: Create New Plan

1. **Click "Create Plan" Button**
   - You'll see a button with a "+" icon in the top right
   - Click **"Create Plan"**

2. **Fill in the Form**
   - See detailed field descriptions below

3. **Save the Plan**
   - Click the **"Create Subscription Plan"** button at the bottom
   - You'll be redirected back to the plans list

---

## 📝 Form Fields Explained

### Basic Information

#### **Plan Name** (Required)
- The display name of your plan
- Example: `Pro`, `Business`, `Enterprise`
- This appears on the pricing page

#### **Slug** (Required)
- URL-friendly identifier
- Auto-generated from the name, but you can edit it
- Example: `pro`, `business`, `enterprise`
- Click the "Generate" button to auto-generate from the name
- Must be unique

#### **Description** (Optional)
- Brief description of what the plan includes
- This appears on the pricing page
- Example: "Perfect for professionals looking to advance their career"

---

### Pricing

#### **Monthly Price** (Required)
- Enter price in **cents** (not dollars!)
- Example: `2000` = $20.00/month
- Example: `9900` = $99.00/month
- The form shows you the dollar amount below the field

#### **Yearly Price** (Required)
- Enter price in **cents** (not dollars!)
- Example: `20000` = $200.00/year (equivalent to $16.67/month)
- Example: `99000` = $990.00/year (equivalent to $82.50/month)
- The form shows you the dollar amount below the field

💡 **Tip:** Make yearly pricing attractive! Usually 10-15 months worth is a good deal.

#### **Stripe Monthly Price ID** (Optional)
- Your Stripe Price ID for monthly billing
- Format: `price_xxxxx`
- Leave empty if you haven't created it in Stripe yet
- You can add this later when setting up Stripe integration

#### **Stripe Yearly Price ID** (Optional)
- Your Stripe Price ID for yearly billing
- Format: `price_xxxxx`
- Leave empty if you haven't created it in Stripe yet
- You can add this later when setting up Stripe integration

---

### Features & Limits

#### **Max Course Access** (Optional)
- Maximum number of courses users can access with this plan
- Leave **empty** for unlimited access
- Example: `10` means users can access 10 courses
- Example: `100` means users can access 100 courses

#### **Trial Days** (Default: 0)
- Number of free trial days
- Example: `7` = 7-day free trial
- Example: `14` = 14-day free trial
- Set to `0` for no trial

#### **Allows Downloads** (Toggle)
- ✅ Enabled = Users can download course materials
- ❌ Disabled = Downloads are blocked

#### **Allows Certificates** (Toggle)
- ✅ Enabled = Users can get completion certificates
- ❌ Disabled = No certificates

#### **Allows Live Classes** (Toggle)
- ✅ Enabled = Users can join live classes
- ❌ Disabled = No live class access

#### **Allows Team Access** (Toggle)
- ✅ Enabled = Team/organization features available
- ❌ Disabled = Individual plans only

#### **Team Seats** (Default: 1)
- Number of team members included
- Only relevant if "Allows Team Access" is enabled
- Example: `5` = plan includes 5 team members
- Example: `10` = plan includes 10 team members

#### **Priority Support** (Toggle)
- ✅ Enabled = Users get priority customer support
- ❌ Disabled = Standard support

---

### Settings

#### **Is Active** (Toggle)
- ✅ Enabled = Plan is visible and purchasable on `/pricing` page
- ❌ Disabled = Plan is hidden (users can't see or purchase it)
- Use this to temporarily disable plans without deleting them

#### **Is Popular** (Toggle)
- ✅ Enabled = Plan will be highlighted as "Most Popular" on pricing page
- ❌ Disabled = Normal plan display
- Usually only one plan should be marked as popular

---

## 📊 Example Plans

### Free Plan
```
Name: Free
Slug: free
Description: Perfect for getting started
Monthly Price: 0 (cents)
Yearly Price: 0 (cents)
Max Course Access: 3
Trial Days: 0
Allows Downloads: ❌
Allows Certificates: ❌
Allows Live Classes: ❌
Allows Team Access: ❌
Priority Support: ❌
Is Active: ✅
Is Popular: ❌
```

### Pro Plan
```
Name: Pro
Slug: pro
Description: For professionals looking to advance their career
Monthly Price: 2999 (cents) = $29.99/month
Yearly Price: 29999 (cents) = $299.99/year
Max Course Access: (empty = unlimited)
Trial Days: 7
Allows Downloads: ✅
Allows Certificates: ✅
Allows Live Classes: ✅
Allows Team Access: ❌
Priority Support: ✅
Is Active: ✅
Is Popular: ✅ (mark as most popular)
```

### Business Plan
```
Name: Business
Slug: business
Description: Perfect for teams and organizations
Monthly Price: 9999 (cents) = $99.99/month
Yearly Price: 99999 (cents) = $999.99/year
Max Course Access: (empty = unlimited)
Trial Days: 14
Allows Downloads: ✅
Allows Certificates: ✅
Allows Live Classes: ✅
Allows Team Access: ✅
Team Seats: 10
Priority Support: ✅
Is Active: ✅
Is Popular: ❌
```

---

## 🔍 After Creating a Plan

### View Your Plans
- After creating, you'll see the plan in the plans list
- You can see:
  - Plan name
  - Monthly/Yearly prices
  - Active status
  - Actions (Edit/Delete)

### Edit a Plan
1. Click the **Edit** button (pencil icon) next to the plan
2. Make your changes
3. Click **"Update Subscription Plan"**

### Delete a Plan
1. Click the **Delete** button (trash icon) next to the plan
2. Confirm the deletion
3. ⚠️ **Warning:** Deleting a plan will affect users with active subscriptions

### Test Your Plan
1. Go to `/pricing` page
2. Verify your new plan appears
3. Test the purchase flow

---

## 💡 Best Practices

### Pricing Strategy
- **Free Plan**: Limited features to attract users
- **Pro Plan**: Most popular, good value
- **Business Plan**: Premium features, higher price

### Feature Differentiation
- Make each plan clearly different
- Free → Limited access
- Pro → Full features, individual use
- Business → Full features + team access

### Trial Periods
- Free plans usually don't need trials (they're already free)
- Pro/Business plans can have 7-14 day trials
- Trials help convert users

### Stripe Integration
- You can create plans without Stripe IDs first
- Add Stripe Price IDs later when ready
- To get Stripe Price IDs:
  1. Go to Stripe Dashboard
  2. Products → Create Product
  3. Add pricing (recurring monthly/yearly)
  4. Copy the Price ID (starts with `price_`)
  5. Paste it in the form

---

## ⚠️ Common Mistakes

### ❌ Wrong Price Format
- **Wrong:** Entering `20` thinking it's $20 (actually $0.20)
- **Correct:** Enter `2000` for $20.00

### ❌ Forgetting to Set Active
- Plan won't appear on `/pricing` page if not active
- Always check "Is Active" for new plans you want to sell

### ❌ Duplicate Slugs
- Each plan slug must be unique
- If you get an error, try a different slug

### ❌ Too Many Popular Plans
- Only one plan should be "Most Popular"
- Having multiple popular plans defeats the purpose

---

## 🆘 Troubleshooting

### "Plan not showing on /pricing page"
- Check if "Is Active" is enabled ✅
- Check if you're logged out (some pages show differently for logged-in users)
- Clear browser cache and refresh

### "Error: Slug already exists"
- The slug you're using is already taken
- Try a different slug (e.g., `pro-v2`, `pro-plan`)

### "Prices look wrong on pricing page"
- Remember: Prices are stored in cents
- Check if you entered the right number of zeros
- Example: $29.99 = 2999 cents, not 29.99

---

## 📍 Quick Links

- **Superadmin Dashboard**: `/superadmin`
- **Subscription Plans List**: `/superadmin/subscription-plans`
- **Create New Plan**: `/superadmin/subscription-plans/create`
- **Public Pricing Page**: `/pricing`

---

## Summary

Creating a subscription plan is simple:

1. Go to `/superadmin/subscription-plans`
2. Click "Create Plan"
3. Fill in:
   - Name, slug, description
   - Prices (in cents!)
   - Features and limits
   - Settings (active, popular)
4. Click "Create Subscription Plan"
5. Done! ✅

The plan will appear on your `/pricing` page for users to purchase.

