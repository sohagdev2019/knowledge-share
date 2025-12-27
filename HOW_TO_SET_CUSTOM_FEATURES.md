# ✨ How to Set Custom Feature List for Subscription Plans

This guide shows you how to add custom feature descriptions (like "Access to 30,000+ top courses") to your subscription plans.

---

## 🎯 Where to Set Features

### Step 1: Navigate to Subscription Plans

1. **Log in as Superadmin**
2. **Go to**: `/superadmin/subscription-plans`
   - Click "Subscription Plans" in the sidebar
   - Or navigate directly to the URL

### Step 2: Create or Edit a Plan

1. **To Create**: Click "Create Plan" button
2. **To Edit**: Click the edit icon (pencil) next to an existing plan

### Step 3: Find "Feature List" Section

Scroll down to the **"Feature List (For Pricing Page)"** section, located **after** the "Features & Limits" section and **before** the "Settings" section.

---

## 📝 How to Add Custom Features

### The Feature List Editor

You'll see a section with:
- **Title**: "Feature List (For Pricing Page)"
- **Description**: Explains these override auto-generated features
- **Add Feature Button**: To add new feature items
- **Input Fields**: One for each feature
- **Delete Buttons**: Trash icon to remove features

### Adding Features

1. **Click "Add Feature" button**
   - A new input field appears

2. **Type your feature description**
   - Example: `Access to 30,000+ top courses`
   - Example: `Certification prep`
   - Example: `Goal-focused recommendations`

3. **Add more features**
   - Click "Add Feature" again for each new feature
   - You can add as many as you want

4. **Remove features**
   - Click the trash icon (🗑️) next to any feature to remove it

---

## 📋 Example Feature Lists

### Personal Plan Features:
```
Access to 26,000+ top courses
Certification prep
Goal-focused recommendations
AI-powered coding exercises
```

### Team Plan Features:
```
Access to 13,000+ top courses
Certification prep
Goal-focused recommendations
AI-powered coding exercises
Analytics and adoption reports
```

### Enterprise Plan Features:
```
Access to 30,000+ top courses
Certification prep
Goal-focused recommendations
AI-powered coding exercises
Advanced analytics and insights
Dedicated customer success team
International course collection featuring 15 languages
Customizable content
Hands-on tech training with add-on
Strategic implementation services with add-on
```

---

## 🔄 How It Works

### Priority System:

1. **Custom Features (Priority 1)**
   - If you add custom features, **only these** will be shown on the pricing page
   - Auto-generated features are **ignored**

2. **Auto-Generated Features (Fallback)**
   - If you leave the feature list empty, the system auto-generates features from your plan settings
   - Based on toggles (downloads, certificates, etc.)

### Storage:

- Features are stored in the `features` JSON field
- Format: `{ "list": ["Feature 1", "Feature 2", ...] }`
- Empty features are automatically filtered out

---

## ✅ Step-by-Step: Adding Features to Pro Plan

1. **Go to**: `/superadmin/subscription-plans`
2. **Click**: Edit icon next to "Pro" plan
3. **Scroll down** to "Feature List (For Pricing Page)" section
4. **Click**: "Add Feature" button
5. **Enter**: `Access to 30,000+ top courses`
6. **Click**: "Add Feature" again
7. **Enter**: `Certification prep`
8. **Continue adding** all your features
9. **Click**: "Update Plan" button
10. **Done!** Features will appear on `/pricing` page

---

## 💡 Tips

1. **Be Specific**: Use numbers and details
   - ✅ "Access to 30,000+ top courses"
   - ❌ "Many courses"

2. **Keep It Short**: One line per feature
   - ✅ "AI-powered coding exercises"
   - ❌ "We offer AI-powered coding exercises that help you learn faster"

3. **Use Action Words**: Start with verbs
   - ✅ "Access to..."
   - ✅ "Get..."
   - ✅ "Unlock..."

4. **Order Matters**: Put most important features first

5. **Consistency**: Use similar format across all plans

---

## 🎨 Feature Display

Features will appear on the pricing page as:
- ✅ Green checkmark icon
- One feature per line
- Clean, readable format

Example:
```
✅ Access to 30,000+ top courses
✅ Certification prep
✅ Goal-focused recommendations
✅ AI-powered coding exercises
```

---

## 🔍 Where Features Appear

Your custom features will be displayed on:

1. **Pricing Page** (`/pricing`)
   - In each plan card
   - Below the price
   - Above the "Get started" button

2. **Comparison Table** (if applicable)
   - In the feature comparison section

---

## ⚠️ Important Notes

1. **Empty Features**: Empty or whitespace-only features are automatically removed
2. **Case Sensitive**: Features are displayed exactly as you type them
3. **No HTML**: Plain text only (no formatting)
4. **Unlimited**: You can add as many features as you want
5. **Editing**: You can edit features anytime by editing the plan

---

## 🆘 Troubleshooting

### "Features not showing on pricing page"
- Make sure you saved the plan after adding features
- Check that "Is Active" is enabled
- Clear browser cache and refresh

### "Features disappeared after saving"
- Make sure you didn't leave any features empty
- Empty features are automatically removed
- Re-add any missing features

### "Want to use auto-generated features again"
- Simply remove all custom features (delete all entries)
- Leave the feature list empty
- System will auto-generate from plan settings

---

## 📊 Quick Reference

| Action | How To |
|--------|--------|
| **Add Feature** | Click "Add Feature" button |
| **Edit Feature** | Type in the input field |
| **Remove Feature** | Click trash icon (🗑️) |
| **Save Features** | Click "Create Plan" or "Update Plan" |
| **Use Auto-Generated** | Leave feature list empty |

---

## Summary

**To set custom features:**

1. Go to `/superadmin/subscription-plans`
2. Create or edit a plan
3. Scroll to "Feature List (For Pricing Page)" section
4. Click "Add Feature" for each feature
5. Type your feature descriptions
6. Save the plan

**Your custom features will now appear on the pricing page!** 🎉

---

## Example: Complete Pro Plan Setup

```
Plan Name: Pro
Slug: pro
Description: For professionals

Pricing:
- Monthly: 29.99 USD
- Yearly: 299.99 USD

Feature List:
✅ Access to 30,000+ top courses
✅ Certification prep
✅ Goal-focused recommendations
✅ AI-powered coding exercises
✅ Advanced analytics and insights
✅ Priority support

Settings:
- Active: ON
- Most Popular: ON
```

That's it! Your plan is ready with custom features! 🚀

