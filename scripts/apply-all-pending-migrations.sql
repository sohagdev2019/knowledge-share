-- ============================================================================
-- COMPREHENSIVE MIGRATION SCRIPT
-- Apply all pending migrations that are missing from your database
-- ============================================================================
-- 
-- This script combines two migrations:
-- 1. course_rating_reaction table (20251221150143)
-- 2. subscription system tables (20251221215616)
--
-- Run this script in your database client (pgAdmin, DBeaver, psql, etc.)
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: Add Course Rating Reaction Table
-- Migration ID: 20251221150143_add_course_rating_reaction_table
-- ============================================================================

-- Add 'Dislike' to ReactionType enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'Dislike' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ReactionType')
  ) THEN
    ALTER TYPE "ReactionType" ADD VALUE 'Dislike';
  END IF;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create course_rating_reaction table if it doesn't exist
CREATE TABLE IF NOT EXISTS "course_rating_reaction" (
    "id" TEXT NOT NULL,
    "ratingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reaction" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_rating_reaction_pkey" PRIMARY KEY ("id")
);

-- Create indexes if they don't exist
CREATE UNIQUE INDEX IF NOT EXISTS "course_rating_reaction_ratingId_userId_key" 
  ON "course_rating_reaction"("ratingId", "userId");

CREATE INDEX IF NOT EXISTS "course_rating_reaction_ratingId_idx" 
  ON "course_rating_reaction"("ratingId");

CREATE INDEX IF NOT EXISTS "course_rating_reaction_userId_idx" 
  ON "course_rating_reaction"("userId");

-- Add foreign keys if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'course_rating_reaction_ratingId_fkey'
  ) THEN
    ALTER TABLE "course_rating_reaction" 
      ADD CONSTRAINT "course_rating_reaction_ratingId_fkey" 
      FOREIGN KEY ("ratingId") 
      REFERENCES "course_rating"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'course_rating_reaction_userId_fkey'
  ) THEN
    ALTER TABLE "course_rating_reaction" 
      ADD CONSTRAINT "course_rating_reaction_userId_fkey" 
      FOREIGN KEY ("userId") 
      REFERENCES "user"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- MIGRATION 2: Add Subscription System Tables
-- Migration ID: 20251221215616_add_subscription_tables
-- ============================================================================

-- Create enums if they don't exist
DO $$
BEGIN
  -- SubscriptionStatus enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionStatus') THEN
    CREATE TYPE "SubscriptionStatus" AS ENUM ('Active', 'Trial', 'Expired', 'Cancelled', 'PastDue');
  END IF;

  -- BillingCycle enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BillingCycle') THEN
    CREATE TYPE "BillingCycle" AS ENUM ('Monthly', 'Yearly');
  END IF;

  -- PaymentStatus enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
    CREATE TYPE "PaymentStatus" AS ENUM ('Pending', 'Paid', 'Failed', 'Refunded');
  END IF;

  -- DiscountType enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DiscountType') THEN
    CREATE TYPE "DiscountType" AS ENUM ('Percentage', 'FixedAmount');
  END IF;

  -- SubscriptionAction enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionAction') THEN
    CREATE TYPE "SubscriptionAction" AS ENUM ('Created', 'Upgraded', 'Downgraded', 'Cancelled', 'Renewed', 'Expired', 'Reactivated');
  END IF;
END $$;

-- Create subscription_plan table
CREATE TABLE IF NOT EXISTS "subscription_plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "priceMonthly" INTEGER NOT NULL,
    "priceYearly" INTEGER NOT NULL,
    "stripePriceIdMonthly" TEXT,
    "stripePriceIdYearly" TEXT,
    "features" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "maxCourseAccess" INTEGER,
    "allowsDownloads" BOOLEAN NOT NULL DEFAULT false,
    "allowsCertificates" BOOLEAN NOT NULL DEFAULT false,
    "allowsLiveClasses" BOOLEAN NOT NULL DEFAULT false,
    "allowsTeamAccess" BOOLEAN NOT NULL DEFAULT false,
    "teamSeats" INTEGER NOT NULL DEFAULT 1,
    "prioritySupport" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plan_pkey" PRIMARY KEY ("id")
);

-- Create user_subscription table
CREATE TABLE IF NOT EXISTS "user_subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'Active',
    "billingCycle" "BillingCycle" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "nextBillingDate" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "cancelledAt" TIMESTAMP(3),
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_subscription_pkey" PRIMARY KEY ("id")
);

-- Create invoice table
CREATE TABLE IF NOT EXISTS "invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "planName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "vatAmount" INTEGER NOT NULL DEFAULT 0,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'Pending',
    "paymentDate" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeInvoiceId" TEXT,
    "pdfUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- Create coupon table
CREATE TABLE IF NOT EXISTS "coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "planIds" TEXT[],
    "appliesToAllPlans" BOOLEAN NOT NULL DEFAULT false,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_pkey" PRIMARY KEY ("id")
);

-- Create subscription_history table
CREATE TABLE IF NOT EXISTS "subscription_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "action" "SubscriptionAction" NOT NULL,
    "oldPlanId" TEXT,
    "newPlanId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_history_pkey" PRIMARY KEY ("id")
);

-- Create indexes for subscription_plan
CREATE UNIQUE INDEX IF NOT EXISTS "subscription_plan_slug_key" ON "subscription_plan"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "subscription_plan_stripePriceIdMonthly_key" ON "subscription_plan"("stripePriceIdMonthly");
CREATE UNIQUE INDEX IF NOT EXISTS "subscription_plan_stripePriceIdYearly_key" ON "subscription_plan"("stripePriceIdYearly");
CREATE INDEX IF NOT EXISTS "subscription_plan_isActive_idx" ON "subscription_plan"("isActive");
CREATE INDEX IF NOT EXISTS "subscription_plan_slug_idx" ON "subscription_plan"("slug");

-- Create indexes for user_subscription
CREATE INDEX IF NOT EXISTS "user_subscription_userId_idx" ON "user_subscription"("userId");
CREATE INDEX IF NOT EXISTS "user_subscription_status_idx" ON "user_subscription"("status");
CREATE INDEX IF NOT EXISTS "user_subscription_planId_idx" ON "user_subscription"("planId");
CREATE INDEX IF NOT EXISTS "user_subscription_stripeSubscriptionId_idx" ON "user_subscription"("stripeSubscriptionId");
CREATE UNIQUE INDEX IF NOT EXISTS "user_subscription_stripeSubscriptionId_key" ON "user_subscription"("stripeSubscriptionId") WHERE "stripeSubscriptionId" IS NOT NULL;

-- Create indexes for invoice
CREATE UNIQUE INDEX IF NOT EXISTS "invoice_invoiceNumber_key" ON "invoice"("invoiceNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "invoice_stripePaymentIntentId_key" ON "invoice"("stripePaymentIntentId") WHERE "stripePaymentIntentId" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "invoice_stripeInvoiceId_key" ON "invoice"("stripeInvoiceId") WHERE "stripeInvoiceId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "invoice_userId_idx" ON "invoice"("userId");
CREATE INDEX IF NOT EXISTS "invoice_subscriptionId_idx" ON "invoice"("subscriptionId");
CREATE INDEX IF NOT EXISTS "invoice_paymentStatus_idx" ON "invoice"("paymentStatus");
CREATE INDEX IF NOT EXISTS "invoice_invoiceNumber_idx" ON "invoice"("invoiceNumber");
CREATE INDEX IF NOT EXISTS "invoice_createdAt_idx" ON "invoice"("createdAt");

-- Create indexes for coupon
CREATE UNIQUE INDEX IF NOT EXISTS "coupon_code_key" ON "coupon"("code");
CREATE INDEX IF NOT EXISTS "coupon_code_idx" ON "coupon"("code");
CREATE INDEX IF NOT EXISTS "coupon_isActive_idx" ON "coupon"("isActive");
CREATE INDEX IF NOT EXISTS "coupon_validFrom_validUntil_idx" ON "coupon"("validFrom", "validUntil");

-- Create indexes for subscription_history
CREATE INDEX IF NOT EXISTS "subscription_history_userId_idx" ON "subscription_history"("userId");
CREATE INDEX IF NOT EXISTS "subscription_history_subscriptionId_idx" ON "subscription_history"("subscriptionId");
CREATE INDEX IF NOT EXISTS "subscription_history_action_idx" ON "subscription_history"("action");
CREATE INDEX IF NOT EXISTS "subscription_history_createdAt_idx" ON "subscription_history"("createdAt");

-- Add foreign keys for subscription tables
DO $$
BEGIN
  -- user_subscription foreign keys
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_subscription_userId_fkey') THEN
    ALTER TABLE "user_subscription" 
      ADD CONSTRAINT "user_subscription_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_subscription_planId_fkey') THEN
    ALTER TABLE "user_subscription" 
      ADD CONSTRAINT "user_subscription_planId_fkey" 
      FOREIGN KEY ("planId") REFERENCES "subscription_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  -- invoice foreign keys
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoice_userId_fkey') THEN
    ALTER TABLE "invoice" 
      ADD CONSTRAINT "invoice_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoice_subscriptionId_fkey') THEN
    ALTER TABLE "invoice" 
      ADD CONSTRAINT "invoice_subscriptionId_fkey" 
      FOREIGN KEY ("subscriptionId") REFERENCES "user_subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  -- subscription_history foreign keys
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscription_history_userId_fkey') THEN
    ALTER TABLE "subscription_history" 
      ADD CONSTRAINT "subscription_history_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscription_history_subscriptionId_fkey') THEN
    ALTER TABLE "subscription_history" 
      ADD CONSTRAINT "subscription_history_subscriptionId_fkey" 
      FOREIGN KEY ("subscriptionId") REFERENCES "user_subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscription_history_oldPlanId_fkey') THEN
    ALTER TABLE "subscription_history" 
      ADD CONSTRAINT "subscription_history_oldPlanId_fkey" 
      FOREIGN KEY ("oldPlanId") REFERENCES "subscription_plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscription_history_newPlanId_fkey') THEN
    ALTER TABLE "subscription_history" 
      ADD CONSTRAINT "subscription_history_newPlanId_fkey" 
      FOREIGN KEY ("newPlanId") REFERENCES "subscription_plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this script, verify the tables were created:
-- 
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
--   AND table_name IN (
--     'course_rating_reaction',
--     'subscription_plan',
--     'user_subscription',
--     'invoice',
--     'coupon',
--     'subscription_history'
--   )
-- ORDER BY table_name;
-- ============================================================================

