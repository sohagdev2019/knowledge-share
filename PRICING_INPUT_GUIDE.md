# 💵 Pricing Input Guide - USD with BDT Conversion

## ✨ New Feature

The subscription plan form now accepts prices in **USD (Dollars)** and automatically:
- ✅ Shows **USD** conversion
- ✅ Shows **BDT (Bangladeshi Taka)** conversion below
- ✅ Stores in **cents** in the database (for Stripe compatibility)

---

## 📝 How It Works

### Input Format
- **Enter prices in USD**: `29.99`, `99.99`, etc.
- **No need to convert**: Just type the dollar amount

### Display
The form automatically shows:
1. **USD**: `$29.99/month` (in green)
2. **BDT**: `৳3,299.00/month` (in blue)

### Storage
- Prices are stored in **cents** in the database
- Example: `29.99` USD → `2999` cents stored

---

## 💰 Current Exchange Rate

**USD to BDT Rate: 110** (1 USD = 110 BDT)

This rate is set in the form component. To update it:
1. Edit: `app/superadmin/subscription-plans/_components/SubscriptionPlanForm.tsx`
2. Find: `const USD_TO_BDT_RATE = 110;`
3. Change to your desired rate

---

## 📋 Example: Creating a Plan

### Step 1: Enter Monthly Price
```
Monthly Price (USD): 29.99
```

### Step 2: See Automatic Conversions
```
$29.99/month (USD)
৳3,299.00/month (BDT)
```

### Step 3: Enter Yearly Price
```
Yearly Price (USD): 299.99
```

### Step 4: See Automatic Conversions
```
$299.99/year (USD)
৳32,998.90/year (BDT)
```

---

## 🎯 For Your 3 Plans

### Free Plan
```
Monthly Price (USD): 0
Yearly Price (USD): 0

Displays:
$0.00/month = ৳0.00/month
$0.00/year = ৳0.00/year
```

### Pro Plan
```
Monthly Price (USD): 29.99
Yearly Price (USD): 299.99

Displays:
$29.99/month = ৳3,299.00/month
$299.99/year = ৳32,998.90/year
```

### Business Plan
```
Monthly Price (USD): 99.99
Yearly Price (USD): 999.99

Displays:
$99.99/month = ৳10,998.90/month
$999.99/year = ৳109,998.90/year
```

---

## ⚙️ Updating Exchange Rate

To change the USD to BDT exchange rate:

1. **Open**: `app/superadmin/subscription-plans/_components/SubscriptionPlanForm.tsx`

2. **Find**: Line ~42
   ```typescript
   const USD_TO_BDT_RATE = 110; // Default rate, update as needed
   ```

3. **Update**: Change `110` to your current rate
   ```typescript
   const USD_TO_BDT_RATE = 115; // Updated rate
   ```

4. **Save**: The form will automatically use the new rate

**Note**: This affects only the display. Prices are still stored in cents based on USD amounts.

---

## 💡 Tips

1. **Decimal Support**: You can enter decimals (e.g., `29.99`, `99.50`)

2. **Zero for Free**: Enter `0` for free plans

3. **Real-time Conversion**: BDT conversion updates as you type

4. **Database Storage**: Always stored in cents (e.g., `29.99` USD = `2999` cents)

5. **Stripe Compatibility**: Prices are still sent to Stripe in cents format

---

## 🔄 Editing Existing Plans

When editing an existing plan:
- Prices are automatically converted from cents (database) to dollars (display)
- You'll see the dollar amount in the input field
- BDT conversion is shown automatically
- Changes are converted back to cents when saving

---

## ✅ Summary

**Before**: Had to enter prices in cents (e.g., `2999` for $29.99)
**Now**: Enter prices in dollars (e.g., `29.99`)

**Benefits**:
- ✅ More intuitive (work with dollars, not cents)
- ✅ See BDT conversion automatically
- ✅ Still compatible with Stripe (stored in cents)
- ✅ Easy to update exchange rate

---

## 🆘 Troubleshooting

### "BDT conversion looks wrong"
- Check the `USD_TO_BDT_RATE` constant in the form component
- Update it to the current exchange rate

### "Price saved incorrectly"
- Make sure you're entering dollars, not cents
- Example: `29.99` not `2999`

### "Display showing wrong amount"
- Check that the database value is in cents
- Form converts cents → dollars for display
- On save, converts dollars → cents for storage

---

Enjoy the new pricing input! 🎉

