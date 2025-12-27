# 📋 Complete List: Subscription Plan Creation Fields

This document lists **ALL** available options when creating or editing a subscription plan in the admin dashboard.

---

## 📝 Form Sections Overview

The subscription plan form is organized into **4 main sections**:

1. **Basic Information** - Plan name, slug, description
2. **Pricing** - Monthly/yearly prices, Stripe integration
3. **Features & Limits** - All feature toggles and limits
4. **Settings** - Active status, popularity

---

## 1️⃣ Basic Information

### **Plan Name** (Required)
- **Field Type**: Text Input
- **Placeholder**: "e.g., Pro, Business"
- **Description**: The display name of your plan
- **Example**: `Pro`, `Business`, `Free`, `Enterprise`
- **Used For**: Displayed on pricing page and throughout the app

### **Slug** (Required)
- **Field Type**: Text Input with "Generate" button
- **Placeholder**: "pro, business"
- **Description**: URL-friendly identifier
- **Auto-Generate**: Click "Generate" button to auto-create from name
- **Example**: `pro`, `business`, `free`
- **Validation**: Must be unique, lowercase, URL-safe

### **Description** (Optional)
- **Field Type**: Textarea (multi-line text)
- **Placeholder**: "Brief description of the plan"
- **Description**: Detailed description of what the plan includes
- **Used For**: Displayed on pricing page under plan name
- **Example**: "Perfect for professionals looking to advance their career"

---

## 2️⃣ Pricing

### **Monthly Price (USD)** (Required)
- **Field Type**: Number input (decimals allowed)
- **Placeholder**: "29.99"
- **Input Format**: Enter in **dollars** (e.g., `29.99`)
- **Auto-Displays**:
  - USD: `$29.99/month` (green text)
  - BDT: `৳3,299.00/month` (blue text) - Auto-converted using 110 BDT = 1 USD
- **Storage**: Automatically converted to cents (2999) for database
- **Example**: `29.99` for $29.99/month

### **Yearly Price (USD)** (Required)
- **Field Type**: Number input (decimals allowed)
- **Placeholder**: "299.99"
- **Input Format**: Enter in **dollars** (e.g., `299.99`)
- **Auto-Displays**:
  - USD: `$299.99/year` (green text)
  - BDT: `৳32,998.90/year` (blue text)
- **Storage**: Automatically converted to cents (29999) for database
- **Example**: `299.99` for $299.99/year

### **Stripe Monthly Price ID** (Optional)
- **Field Type**: Text input
- **Placeholder**: "price_xxx (optional)"
- **Description**: Stripe Price ID for monthly billing
- **Format**: Starts with `price_` followed by alphanumeric characters
- **Example**: `price_1ABC123xyz456monthly`
- **Note**: Leave empty if not using Stripe yet, or for free plans

### **Stripe Yearly Price ID** (Optional)
- **Field Type**: Text input
- **Placeholder**: "price_xxx (optional)"
- **Description**: Stripe Price ID for yearly billing
- **Format**: Starts with `price_` followed by alphanumeric characters
- **Example**: `price_1ABC123xyz456yearly`
- **Note**: Leave empty if not using Stripe yet, or for free plans

---

## 3️⃣ Features & Limits

### **Max Course Access** (Optional)
- **Field Type**: Number input
- **Placeholder**: "Leave empty for unlimited"
- **Description**: Maximum number of courses users can access
- **Options**:
  - Enter a number: `3`, `10`, `50`
  - Leave empty: Unlimited access
- **Example**:
  - Free Plan: `3`
  - Pro Plan: `3`
  - Business Plan: (empty = unlimited)

### **Trial Days** (Required, Default: 7)
- **Field Type**: Dropdown Select
- **Options**:
  - `No Trial (0 days)` - No free trial
  - `7 Days` - 7-day free trial ⭐ (Default)
  - `10 Days` - 10-day free trial
  - `15 Days` - 15-day free trial
- **Description**: Number of free trial days for new subscribers
- **Recommended**: 
  - Free Plan: `0 days`
  - Paid Plans: `7 days`

---

### **Feature Toggles** (All Boolean - ON/OFF)

These features are displayed in a **2-column grid layout**:

#### **Column 1 Features:**

##### ✅ **Allows Downloads**
- **Toggle**: Switch (ON/OFF)
- **Description**: "Users can download course materials"
- **Default**: OFF
- **What it enables**: 
  - Download course videos
  - Download PDFs and resources
  - Save materials for offline use

##### ✅ **Live Q&A Sessions**
- **Toggle**: Switch (ON/OFF)
- **Description**: "Access to live Q&A sessions"
- **Default**: OFF
- **What it enables**: 
  - Join live instructor Q&A sessions
  - Ask questions in real-time
- **Conditional Field**: When ON, shows "Max Live Q&A Sessions" input

##### ✅ **Community Support**
- **Toggle**: Switch (ON/OFF)
- **Description**: "Access to community forums and discussions"
- **Default**: OFF
- **What it enables**: 
  - Access to community forums
  - Participate in discussions
  - Get help from community

##### ✅ **Team Access**
- **Toggle**: Switch (ON/OFF)
- **Description**: "Enable team/organization features"
- **Default**: OFF
- **What it enables**: 
  - Team collaboration features
  - Shared learning environment
- **Conditional Fields**: When ON, shows:
  - Team Seats input
  - Team Management toggle

#### **Column 2 Features:**

##### ✅ **Allows Certificates**
- **Toggle**: Switch (ON/OFF)
- **Description**: "Users can download completion certificates"
- **Default**: OFF
- **What it enables**: 
  - Generate completion certificates
  - Download PDF certificates
  - Share certificates

##### ✅ **Progress Tracking**
- **Toggle**: Switch (ON/OFF)
- **Description**: "Basic progress tracking and analytics"
- **Default**: OFF
- **What it enables**: 
  - View learning progress
  - Track completion rates
  - Analytics dashboard

##### ✅ **Priority Support**
- **Toggle**: Switch (ON/OFF)
- **Description**: "Faster customer support response"
- **Default**: OFF
- **What it enables**: 
  - Faster response times
  - Priority ticket handling
  - Dedicated support channel
- **Conditional Field**: When ON, shows "Max Priority Support Tickets" input

---

### **Conditional Fields** (Appear based on toggles)

#### **Max Live Q&A Sessions** (Conditional)
- **Shows When**: "Live Q&A Sessions" toggle is ON
- **Field Type**: Number input
- **Placeholder**: "Leave empty for unlimited"
- **Description**: Maximum number of live Q&A sessions per month
- **Options**:
  - Enter a number: `3`, `5`, `10`
  - Leave empty: Unlimited sessions
- **Example**:
  - Pro Plan: `3` sessions/month
  - Business Plan: (empty = unlimited)

#### **Max Priority Support Tickets** (Conditional)
- **Shows When**: "Priority Support" toggle is ON
- **Field Type**: Number input
- **Placeholder**: "Leave empty for unlimited"
- **Description**: Maximum number of priority support tickets per month
- **Options**:
  - Enter a number: `2`, `5`, `10`
  - Leave empty: Unlimited tickets
- **Example**:
  - Pro Plan: `2` tickets/month
  - Business Plan: (empty = unlimited)

#### **Team Seats** (Conditional)
- **Shows When**: "Team Access" toggle is ON
- **Field Type**: Number input
- **Placeholder**: "10"
- **Description**: Number of team members included in this plan
- **Default**: `1`
- **Example**: `1`, `5`, `10`, `50`

#### **Team Management** (Conditional)
- **Shows When**: "Team Access" toggle is ON
- **Toggle**: Switch (ON/OFF)
- **Description**: "Advanced team management and administration features"
- **Default**: OFF
- **What it enables**: 
  - Admin dashboard for teams
  - Member management
  - Team analytics
  - Role-based access control

---

## 4️⃣ Settings

### **Active** (Required, Default: ON)
- **Toggle**: Switch (ON/OFF)
- **Description**: "Plan is available for purchase"
- **Default**: ON ✅
- **When ON**: 
  - Plan appears on `/pricing` page
  - Users can subscribe to this plan
- **When OFF**: 
  - Plan is hidden from pricing page
  - Users cannot subscribe
  - Existing subscribers keep access

### **Most Popular** (Default: OFF)
- **Toggle**: Switch (ON/OFF)
- **Description**: "Show 'Most Popular' badge on pricing page"
- **Default**: OFF
- **When ON**: 
  - Plan gets highlighted on pricing page
  - Shows "Most Popular" badge
  - Usually only one plan should have this
- **Recommendation**: Enable for your main/mid-tier plan (e.g., Pro)

---

## 📊 Complete Field Summary Table

| Section | Field Name | Type | Required | Default | Options |
|---------|-----------|------|----------|---------|---------|
| **Basic** | Plan Name | Text | ✅ Yes | - | Any text |
| **Basic** | Slug | Text | ✅ Yes | - | Auto-generate or manual |
| **Basic** | Description | Textarea | ❌ No | - | Any text |
| **Pricing** | Monthly Price (USD) | Number | ✅ Yes | `0` | Decimal (e.g., 29.99) |
| **Pricing** | Yearly Price (USD) | Number | ✅ Yes | `0` | Decimal (e.g., 299.99) |
| **Pricing** | Stripe Monthly ID | Text | ❌ No | - | price_xxx |
| **Pricing** | Stripe Yearly ID | Text | ❌ No | - | price_xxx |
| **Features** | Max Course Access | Number | ❌ No | Unlimited | Number or empty |
| **Features** | Trial Days | Select | ✅ Yes | `7` | 0, 7, 10, 15 |
| **Features** | Allows Downloads | Toggle | ✅ Yes | OFF | ON/OFF |
| **Features** | Allows Certificates | Toggle | ✅ Yes | OFF | ON/OFF |
| **Features** | Live Q&A Sessions | Toggle | ✅ Yes | OFF | ON/OFF |
| **Features** | Max Live Q&A Sessions | Number | ❌ No | Unlimited | Conditional* |
| **Features** | Progress Tracking | Toggle | ✅ Yes | OFF | ON/OFF |
| **Features** | Community Support | Toggle | ✅ Yes | OFF | ON/OFF |
| **Features** | Priority Support | Toggle | ✅ Yes | OFF | ON/OFF |
| **Features** | Max Priority Tickets | Number | ❌ No | Unlimited | Conditional* |
| **Features** | Team Access | Toggle | ✅ Yes | OFF | ON/OFF |
| **Features** | Team Seats | Number | ✅ Yes | `1` | Conditional* |
| **Features** | Team Management | Toggle | ✅ Yes | OFF | Conditional* |
| **Settings** | Active | Toggle | ✅ Yes | ON | ON/OFF |
| **Settings** | Most Popular | Toggle | ✅ Yes | OFF | ON/OFF |

*Conditional fields only appear when their parent toggle is enabled.

---

## 🎯 Recommended Configurations

### **Free Plan**
```
Plan Name: Free
Slug: free
Description: Perfect for getting started
Monthly Price: 0
Yearly Price: 0
Stripe IDs: (leave empty)

Max Course Access: 3
Trial Days: No Trial (0 days)

All Features: OFF
Team Access: OFF

Active: ON
Most Popular: OFF
```

### **Pro Plan**
```
Plan Name: Pro
Slug: pro
Description: For professionals looking to advance their career
Monthly Price: 29.99
Yearly Price: 299.99
Stripe IDs: (add your Stripe Price IDs)

Max Course Access: 3
Trial Days: 7 Days

✅ Downloads: ON
✅ Certificates: ON
✅ Live Q&A: ON → Max: 3
✅ Progress Tracking: ON
✅ Community Support: ON
✅ Priority Support: ON → Max: 2

Team Access: OFF

Active: ON
Most Popular: ON ⭐
```

### **Business Plan**
```
Plan Name: Business
Slug: business
Description: Perfect for teams and organizations
Monthly Price: 99.99
Yearly Price: 999.99
Stripe IDs: (add your Stripe Price IDs)

Max Course Access: (empty = unlimited)
Trial Days: 7 Days

✅ Downloads: ON
✅ Certificates: ON
✅ Live Q&A: ON → Max: (empty = unlimited)
✅ Progress Tracking: ON
✅ Community Support: ON
✅ Priority Support: ON → Max: (empty = unlimited)

✅ Team Access: ON
  → Team Seats: 1
  → Team Management: ON

Active: ON
Most Popular: OFF
```

---

## ✅ Quick Checklist

When creating a plan, make sure you have:

- [ ] Plan name and slug filled in
- [ ] Pricing set (monthly and yearly)
- [ ] Trial days selected
- [ ] Feature toggles configured
- [ ] Limits set (if applicable)
- [ ] Team settings (if team plan)
- [ ] Active status enabled
- [ ] Popular status (if applicable)
- [ ] Stripe IDs (for paid plans)

---

## 💡 Tips

1. **Trial Days**: Always offer trials for paid plans to increase conversions
2. **Popular Badge**: Only mark ONE plan as popular (usually mid-tier)
3. **Stripe IDs**: Add them when ready, but you can create plans without them first
4. **Limits**: Leave empty for "unlimited" access
5. **Team Seats**: Business plans usually start with 1 seat, allow upgrades later
6. **Pricing**: Yearly plans should offer 10-15% discount vs monthly

---

## 📚 Related Documentation

- `HOW_TO_CREATE_SUBSCRIPTION_PLANS.md` - Step-by-step creation guide
- `SUBSCRIPTION_PLANS_SETUP.md` - Complete plan configurations
- `STRIPE_PRODUCT_DETAILS.md` - Stripe integration details

---

**This is the complete list of all options available when creating a subscription plan!** 🎉

