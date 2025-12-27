# ⚡ Quick Guide: Creating Stripe Price IDs

## 🎯 The Fastest Way (5 Minutes)

### Step 1: Open Stripe Dashboard
👉 Go to: [https://dashboard.stripe.com](https://dashboard.stripe.com)

### Step 2: Create Product
1. Click **"Products"** in left sidebar
2. Click **"+ Add product"** button
3. Enter:
   - **Name**: `Pro Plan` (or your plan name)
   - **Description**: (optional)
4. Click **"Save product"**

### Step 3: Add Monthly Price
1. In the product page, click **"Add pricing"**
2. Fill in:
   - **Price**: `29.99` (for $29.99/month)
   - **Billing period**: Select **"Recurring"** → **"Monthly"**
   - **Currency**: `USD`
3. Click **"Save pricing"**
4. **Copy the Price ID** (starts with `price_`) - this is your monthly Price ID!

### Step 4: Add Yearly Price
1. Still on the same product, click **"Add pricing"** again
2. Fill in:
   - **Price**: `299.99` (for $299.99/year)
   - **Billing period**: Select **"Recurring"** → **"Yearly"**
   - **Currency**: `USD`
3. Click **"Save pricing"**
4. **Copy the Price ID** (starts with `price_`) - this is your yearly Price ID!

### Step 5: Use in Your Form
1. Go back to your subscription plan form
2. Paste monthly Price ID → **"Stripe Monthly Price ID"** field
3. Paste yearly Price ID → **"Stripe Yearly Price ID"** field
4. **Important**: Make sure your form prices match:
   - Monthly: `2999` cents (which is $29.99)
   - Yearly: `29999` cents (which is $299.99)
5. Save!

---

## 📊 Example: Complete Setup

### In Stripe Dashboard:
```
Product Name: Pro Plan
├── Monthly Price: $29.99 → Price ID: price_1ABC123xyz456monthly
└── Yearly Price: $299.99 → Price ID: price_1ABC123xyz456yearly
```

### In Your Form:
```
Plan Name: Pro
Monthly Price (cents): 2999
Yearly Price (cents): 29999
Stripe Monthly Price ID: price_1ABC123xyz456monthly
Stripe Yearly Price ID: price_1ABC123xyz456yearly
```

---

## ⚠️ Important Reminders

1. **Price Format**:
   - Stripe Dashboard: Enter in **dollars** ($29.99)
   - Your Form: Enter in **cents** (2999)

2. **Price IDs are Optional**:
   - You can create the plan without Price IDs first
   - Add them later when ready
   - But users won't be able to purchase until Price IDs are added

3. **Test vs Live**:
   - Use **Test Mode** for development
   - Use **Live Mode** for production
   - Price IDs are different for each mode

---

## 🆘 Can't Find Price ID?

1. Go to Stripe Dashboard → **Products**
2. Click on your product
3. You'll see all prices listed
4. Click on a price → Price ID is shown at the top

---

## ✅ Quick Checklist

- [ ] Created product in Stripe
- [ ] Added monthly recurring price
- [ ] Added yearly recurring price
- [ ] Copied monthly Price ID
- [ ] Copied yearly Price ID
- [ ] Pasted both in form
- [ ] Verified prices match (cents in form)
- [ ] Saved plan

Done! 🎉

