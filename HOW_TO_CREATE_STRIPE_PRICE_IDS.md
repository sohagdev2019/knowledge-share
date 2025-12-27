# 💳 How to Create Stripe Price IDs for Subscription Plans

This guide will show you how to create Stripe Price IDs that you'll use in the subscription plan form.

---

## 🎯 What are Stripe Price IDs?

Stripe Price IDs are unique identifiers (like `price_1ABC123xyz`) that represent a specific pricing configuration in Stripe. You need one for:
- **Monthly billing** → `stripePriceIdMonthly`
- **Yearly billing** → `stripePriceIdYearly`

---

## 📋 Method 1: Create in Stripe Dashboard (Recommended for First Time)

### Step 1: Log into Stripe Dashboard

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Log in with your Stripe account
3. Make sure you're in **Test mode** (for testing) or **Live mode** (for production)

### Step 2: Create a Product

1. In the left sidebar, click **"Products"**
2. Click the **"+ Add product"** button (top right)
3. Fill in the product details:
   - **Name**: Your plan name (e.g., "Pro Plan")
   - **Description**: Brief description (optional)
   - **Images**: Add logo/image (optional)
   - **Metadata**: Add any custom data (optional)

### Step 3: Add Monthly Pricing

1. In the **"Pricing"** section, click **"Add pricing"**
2. Configure monthly pricing:
   - **Price**: Enter your monthly price (e.g., `29.99` for $29.99)
   - **Billing period**: Select **"Recurring"** → **"Monthly"**
   - **Currency**: Select **"USD"** (or your currency)
   - **Price ID**: Leave empty (Stripe will auto-generate)
3. Click **"Save pricing"**

### Step 4: Add Yearly Pricing

1. Still in the same product, click **"Add pricing"** again
2. Configure yearly pricing:
   - **Price**: Enter your yearly price (e.g., `299.99` for $299.99)
   - **Billing period**: Select **"Recurring"** → **"Yearly"**
   - **Currency**: Select **"USD"** (or your currency)
   - **Price ID**: Leave empty (Stripe will auto-generate)
3. Click **"Save pricing"**

### Step 5: Get the Price IDs

1. After saving, you'll see the product with both prices
2. Click on the **monthly price** → You'll see the Price ID (starts with `price_`)
3. Copy the monthly Price ID
4. Click on the **yearly price** → Copy the yearly Price ID

**Example Price IDs:**
- Monthly: `price_1ABC123xyz456monthly`
- Yearly: `price_1ABC123xyz456yearly`

### Step 6: Use in Your Form

1. Go back to your subscription plan form
2. Paste the monthly Price ID in **"Stripe Monthly Price ID"**
3. Paste the yearly Price ID in **"Stripe Yearly Price ID"**
4. Save the plan

---

## 🚀 Method 2: Create Programmatically (Advanced)

You can also create Stripe Price IDs programmatically using the Stripe API. Here's how:

### Using Stripe API Directly

```javascript
// Example: Create monthly price
const monthlyPrice = await stripe.prices.create({
  product: 'prod_xxxxx', // Your product ID
  unit_amount: 2999, // $29.99 in cents
  currency: 'usd',
  recurring: {
    interval: 'month',
  },
});

console.log('Monthly Price ID:', monthlyPrice.id);

// Example: Create yearly price
const yearlyPrice = await stripe.prices.create({
  product: 'prod_xxxxx', // Same product ID
  unit_amount: 29999, // $299.99 in cents
  currency: 'usd',
  recurring: {
    interval: 'year',
  },
});

console.log('Yearly Price ID:', yearlyPrice.id);
```

### Using Stripe CLI (Command Line)

```bash
# Install Stripe CLI first: https://stripe.com/docs/stripe-cli

# Create monthly price
stripe prices create \
  --product prod_xxxxx \
  --unit-amount 2999 \
  --currency usd \
  --recurring interval=month

# Create yearly price
stripe prices create \
  --product prod_xxxxx \
  --unit-amount 29999 \
  --currency usd \
  --recurring interval=year
```

---

## 📝 Step-by-Step: Creating a "Pro Plan" Example

Let's create a complete example for a "Pro Plan" with $29.99/month and $299.99/year:

### In Stripe Dashboard:

1. **Create Product:**
   - Name: `Pro Plan`
   - Description: `Professional subscription plan`

2. **Add Monthly Price:**
   - Price: `29.99`
   - Billing: Recurring → Monthly
   - Currency: USD
   - **Price ID Generated**: `price_1ABC123xyz456monthly` ← Copy this!

3. **Add Yearly Price:**
   - Price: `299.99`
   - Billing: Recurring → Yearly
   - Currency: USD
   - **Price ID Generated**: `price_1ABC123xyz456yearly` ← Copy this!

### In Your Form:

1. **Plan Name**: `Pro`
2. **Slug**: `pro`
3. **Monthly Price (cents)**: `2999` (this is $29.99)
4. **Yearly Price (cents)**: `29999` (this is $299.99)
5. **Stripe Monthly Price ID**: `price_1ABC123xyz456monthly`
6. **Stripe Yearly Price ID**: `price_1ABC123xyz456yearly`

---

## ⚠️ Important Notes

### Price Format
- **In Stripe Dashboard**: Enter prices in dollars (e.g., `29.99`)
- **In Your Form**: Enter prices in **cents** (e.g., `2999` for $29.99)
- **Stripe API**: Always uses cents

### Test vs Live Mode
- **Test Mode**: Price IDs start with `price_` (test keys)
- **Live Mode**: Price IDs also start with `price_` but are different
- Make sure you're using the correct mode for your environment

### One Product, Multiple Prices
- You can add multiple prices to the same product
- One for monthly, one for yearly
- Both prices belong to the same product

### Price IDs are Permanent
- Once created, Price IDs don't change
- You can archive prices but can't delete them
- If you need to change pricing, create new prices

---

## 🔍 How to Find Existing Price IDs

If you already created prices but forgot the IDs:

1. Go to Stripe Dashboard → **Products**
2. Click on your product
3. You'll see all prices listed
4. Click on a price to see its details
5. The Price ID is shown at the top (starts with `price_`)

---

## ✅ Verification Checklist

Before saving your subscription plan:

- [ ] Created product in Stripe Dashboard
- [ ] Added monthly price (recurring, monthly)
- [ ] Added yearly price (recurring, yearly)
- [ ] Copied monthly Price ID (starts with `price_`)
- [ ] Copied yearly Price ID (starts with `price_`)
- [ ] Pasted monthly Price ID in form
- [ ] Pasted yearly Price ID in form
- [ ] Prices in form match prices in Stripe (in cents)
- [ ] Saved the subscription plan

---

## 🆘 Troubleshooting

### "Price ID not found" Error
- **Cause**: Price ID doesn't exist or is from wrong mode (test/live)
- **Fix**: Verify the Price ID in Stripe Dashboard, check test/live mode

### "Price is not recurring" Error
- **Cause**: You created a one-time price instead of recurring
- **Fix**: Create a new price with "Recurring" billing period

### "Price currency mismatch" Error
- **Cause**: Price is in different currency than expected
- **Fix**: Make sure all prices use the same currency (usually USD)

### Prices Don't Match
- **Cause**: Form prices (in cents) don't match Stripe prices
- **Fix**: 
  - Stripe: $29.99
  - Form: 2999 cents (which is $29.99) ✅
  - Form: 29.99 cents (which is $0.30) ❌

---

## 💡 Pro Tips

1. **Use Descriptive Product Names**
   - "Pro Plan" is better than "Plan 1"
   - Makes it easier to find in Stripe Dashboard

2. **Add Metadata**
   - Add custom metadata to products/prices
   - Helps with tracking and organization

3. **Test First**
   - Always test in Stripe Test Mode first
   - Use test card: `4242 4242 4242 4242`

4. **Keep Prices in Sync**
   - Make sure form prices match Stripe prices
   - Update both if you change pricing

5. **Document Your Prices**
   - Keep a spreadsheet of Price IDs
   - Makes it easier to manage multiple plans

---

## 📚 Additional Resources

- **Stripe Documentation**: [Creating Products and Prices](https://stripe.com/docs/products-prices/overview)
- **Stripe Dashboard**: [https://dashboard.stripe.com](https://dashboard.stripe.com)
- **Stripe API Reference**: [Prices API](https://stripe.com/docs/api/prices)

---

## Summary

**Quick Steps:**
1. Go to Stripe Dashboard → Products
2. Create a product (e.g., "Pro Plan")
3. Add monthly price (recurring, monthly)
4. Add yearly price (recurring, yearly)
5. Copy both Price IDs
6. Paste them in your subscription plan form
7. Save!

**Remember:**
- Stripe prices: Enter in dollars ($29.99)
- Form prices: Enter in cents (2999)
- Price IDs: Copy from Stripe Dashboard

That's it! Your subscription plan will now work with Stripe checkout. 🎉

