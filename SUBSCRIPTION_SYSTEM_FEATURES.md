# 📋 Subscription System - Complete Feature List

## Overview
Udemy-style subscription system with pricing plans, subscription management, invoices, and access control.

---

## 🗄️ Phase 1: Database Models & Schema

### 1.1 SubscriptionPlan Model
- [x] id (UUID)
- [x] name (Free, Pro, Business/Team)
- [x] slug (unique)
- [x] description
- [x] price_monthly (Int - in cents)
- [x] price_yearly (Int - in cents)
- [x] stripe_price_id_monthly (String, optional)
- [x] stripe_price_id_yearly (String, optional)
- [x] features (JSON) - Course access limit, downloads, certificates, etc.
- [x] is_active (Boolean)
- [x] is_popular (Boolean)
- [x] trial_days (Int, default 0)
- [x] max_course_access (Int or null for unlimited)
- [x] allows_downloads (Boolean)
- [x] allows_certificates (Boolean)
- [x] allows_live_classes (Boolean)
- [x] allows_team_access (Boolean)
- [x] team_seats (Int, default 1)
- [x] priority_support (Boolean)
- [x] created_at, updated_at

### 1.2 UserSubscription Model
- [x] id (UUID)
- [x] user_id (FK to User)
- [x] plan_id (FK to SubscriptionPlan)
- [x] status (Active, Trial, Expired, Cancelled, PastDue)
- [x] billing_cycle (Monthly, Yearly)
- [x] start_date (DateTime)
- [x] end_date (DateTime)
- [x] next_billing_date (DateTime)
- [x] auto_renew (Boolean)
- [x] cancelled_at (DateTime, nullable)
- [x] stripe_subscription_id (String, unique, nullable)
- [x] stripe_customer_id (String, nullable)
- [x] created_at, updated_at

### 1.3 Invoice Model
- [x] id (UUID)
- [x] invoice_number (String, unique)
- [x] user_id (FK to User)
- [x] subscription_id (FK to UserSubscription, nullable)
- [x] plan_name (String)
- [x] amount (Int - in cents)
- [x] currency (String, default "usd")
- [x] vat_amount (Int, default 0)
- [x] discount_amount (Int, default 0)
- [x] total_amount (Int)
- [x] payment_status (Pending, Paid, Failed, Refunded)
- [x] payment_date (DateTime, nullable)
- [x] payment_method (String, nullable)
- [x] stripe_payment_intent_id (String, nullable)
- [x] stripe_invoice_id (String, nullable)
- [x] pdf_url (String, nullable)
- [x] metadata (JSON, nullable)
- [x] created_at, updated_at

### 1.4 Coupon Model
- [x] id (UUID)
- [x] code (String, unique)
- [x] description (String, nullable)
- [x] discount_type (Percentage, FixedAmount)
- [x] discount_value (Int)
- [x] plan_ids (String[] - array of plan IDs this coupon applies to)
- [x] applies_to_all_plans (Boolean)
- [x] max_uses (Int, nullable - null = unlimited)
- [x] used_count (Int, default 0)
- [x] valid_from (DateTime)
- [x] valid_until (DateTime, nullable)
- [x] is_active (Boolean)
- [x] created_at, updated_at

### 1.5 SubscriptionHistory Model (for audit trail)
- [x] id (UUID)
- [x] user_id (FK to User)
- [x] subscription_id (FK to UserSubscription)
- [x] action (Created, Upgraded, Downgraded, Cancelled, Renewed, Expired)
- [x] old_plan_id (FK to SubscriptionPlan, nullable)
- [x] new_plan_id (FK to SubscriptionPlan, nullable)
- [x] metadata (JSON, nullable)
- [x] created_at

---

## 🌐 Phase 2: Frontend Pages & Components

### 2.1 /pricing Page (Public)
- [x] Display all active subscription plans
- [x] Monthly/Yearly toggle switch
- [x] "Most Popular" badge highlighting
- [x] Feature comparison table
- [x] FAQ section
- [x] CTA buttons (Start Free, Upgrade to Pro, Buy Now)
- [x] Money-back guarantee note
- [x] Currency display (USD/BDT)

### 2.2 /checkout Page
- [x] Plan selection confirmation
- [x] Billing cycle selection (monthly/yearly)
- [x] Coupon code input
- [x] Price breakdown (subtotal, discount, VAT, total)
- [x] Payment method selection
- [x] Billing address form (if needed)
- [x] Terms & conditions checkbox
- [x] Complete purchase button

### 2.3 /dashboard/subscription (User Dashboard)
- [x] Active subscription card
  - Current plan name
  - Status badge (Active/Trial/Expired/Cancelled)
  - Billing cycle
  - Next billing date
  - Remaining days countdown
- [x] Action buttons:
  - Change Plan (Upgrade/Downgrade)
  - Cancel Subscription
  - Resume Subscription (if cancelled)
  - View Invoices
  - Update Payment Method
- [x] Subscription history timeline
- [x] Usage statistics (courses accessed, downloads, etc.)

### 2.4 /dashboard/subscription/invoices
- [x] Invoice list table
- [x] Filter by date range
- [x] Download PDF button
- [x] Invoice details modal/page

### 2.5 /dashboard/subscription/change-plan
- [x] Plan comparison view
- [x] Upgrade/Downgrade options
- [x] Prorated pricing calculation display
- [x] Confirm plan change button

---

## 🔧 Phase 3: Backend Logic & APIs

### 3.1 Subscription Purchase Flow
- [x] Create checkout session with Stripe
- [x] Handle coupon code validation
- [x] Calculate pricing (with discounts, VAT)
- [x] Create subscription record on payment success
- [x] Send welcome email
- [x] Generate first invoice

### 3.2 Plan Management (Admin)
- [x] Create/edit/delete subscription plans
- [x] Enable/disable plans
- [x] Set pricing (monthly/yearly)
- [x] Configure features per plan
- [x] Create Stripe products/prices

### 3.3 Coupon Management (Admin)
- [x] Create/edit/delete coupons
- [x] Set discount rules
- [x] Track usage
- [x] Set expiration dates

### 3.4 Upgrade/Downgrade Logic
- [x] Calculate prorated amount
- [x] Immediate upgrade (charge difference)
- [x] Schedule downgrade (apply at next billing cycle)
- [x] Update subscription record
- [x] Send confirmation email

### 3.5 Cancel Subscription
- [x] Mark subscription as cancelled
- [x] Keep access until billing period ends
- [x] Disable auto-renew
- [x] Cancel Stripe subscription
- [x] Send cancellation confirmation email
- [x] Set expiry reminders

### 3.6 Resume Subscription
- [x] Reactivate cancelled subscription
- [x] Restore Stripe subscription
- [x] Send reactivation email

### 3.7 Invoice Generation
- [x] Auto-generate invoice on payment
- [x] Generate PDF invoice
- [x] Store PDF in S3
- [x] Email invoice to user
- [x] Include VAT calculations
- [x] Unique invoice numbering

---

## 🔐 Phase 4: Access Control & Middleware

### 4.1 Subscription-Based Access Control
- [x] Middleware to check subscription status
- [x] Course access validation
- [x] Download permission check
- [x] Certificate generation permission
- [x] Live class access check
- [x] Team feature access check

### 4.2 Course Access Rules
- [x] Check if course is in subscription plan
- [x] Check course access limit (for Free plan)
- [x] Block access if subscription expired
- [x] Show upgrade prompts

---

## 📧 Phase 5: Notifications & Emails

### 5.1 Email Templates
- [x] Subscription activated
- [x] Payment successful
- [x] Payment failed
- [x] Plan expiring soon (7 days, 3 days, 1 day)
- [x] Subscription cancelled
- [x] Subscription renewed
- [x] Plan changed (upgrade/downgrade)
- [x] Invoice generated

### 5.2 In-App Notifications
- [x] Subscription status changes
- [x] Payment reminders
- [x] Feature access warnings

---

## 🔌 Phase 6: Payment Integration

### 6.1 Stripe Integration
- [x] Create Stripe subscription products
- [x] Handle subscription checkout
- [x] Webhook handlers for:
  - subscription.created
  - subscription.updated
  - subscription.deleted
  - invoice.paid
  - invoice.payment_failed
  - customer.subscription.updated
- [x] Handle failed payments
- [x] Retry payment logic

### 6.2 SSLCommerz Integration (Future)
- [x] Payment gateway setup
- [x] Webhook handling
- [x] Payment verification

---

## 🛠️ Phase 7: Admin Panel

### 7.1 Subscription Plans Management
- [x] List all plans
- [x] Create new plan
- [x] Edit plan details
- [x] Toggle plan active/inactive
- [x] Set as popular plan

### 7.2 Subscriptions Management
- [x] View all subscriptions
- [x] Filter by status, plan, date
- [x] View subscription details
- [x] Manually activate/cancel subscriptions
- [x] Refund management

### 7.3 Coupons Management
- [x] List all coupons
- [x] Create/edit coupons
- [x] View usage statistics
- [x] Enable/disable coupons

### 7.4 Invoice Management
- [x] View all invoices
- [x] Filter and search
- [x] Download invoices
- [x] Refund invoices
- [x] Invoice analytics

### 7.5 Subscription Analytics
- [x] Total active subscriptions
- [x] Revenue metrics (MRR, ARR)
- [x] Churn rate
- [x] Plan distribution
- [x] Revenue by plan
- [x] Conversion funnel

---

## 🧪 Phase 8: Testing & Validation

### 8.1 Unit Tests
- [x] Subscription creation
- [x] Plan upgrade/downgrade
- [x] Access control logic
- [x] Invoice generation
- [x] Coupon validation

### 8.2 Integration Tests
- [x] Stripe webhook handling
- [x] Payment flow end-to-end
- [x] Subscription lifecycle

---

## 📱 Phase 9: Additional Features (Optional)

### 9.1 Free Trial
- [x] 7-day free trial support
- [x] Trial expiration handling
- [x] Auto-convert to paid

### 9.2 Team Subscriptions
- [x] Invite team members
- [x] Manage team seats
- [x] Team billing

### 9.3 Referral System
- [x] Referral codes
- [x] Discount tracking
- [x] Reward system

---

## 📊 Implementation Priority

1. **HIGH PRIORITY** (MVP):
   - Database models (SubscriptionPlan, UserSubscription, Invoice, Coupon)
   - /pricing page with dynamic plans
   - Checkout flow
   - Stripe subscription integration
   - Basic access control
   - Invoice generation

2. **MEDIUM PRIORITY**:
   - User subscription dashboard
   - Upgrade/downgrade logic
   - Cancel subscription
   - Email notifications
   - Admin panel for plans

3. **LOW PRIORITY** (Nice to have):
   - Coupon system
   - Team subscriptions
   - Referral system
   - Advanced analytics
   - SSLCommerz integration

---

## 🎯 Success Metrics

- Subscription conversion rate
- Monthly Recurring Revenue (MRR)
- Churn rate
- Average Revenue Per User (ARPU)
- Plan distribution
- Invoice generation success rate

