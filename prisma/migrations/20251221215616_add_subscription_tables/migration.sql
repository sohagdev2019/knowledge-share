-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('Active', 'Trial', 'Expired', 'Cancelled', 'PastDue');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('Monthly', 'Yearly');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Pending', 'Paid', 'Failed', 'Refunded');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('Percentage', 'FixedAmount');

-- CreateEnum
CREATE TYPE "SubscriptionAction" AS ENUM ('Created', 'Upgraded', 'Downgraded', 'Cancelled', 'Renewed', 'Expired', 'Reactivated');

-- CreateTable
CREATE TABLE "subscription_plan" (
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

-- CreateTable
CREATE TABLE "user_subscription" (
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

-- CreateTable
CREATE TABLE "invoice" (
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

-- CreateTable
CREATE TABLE "coupon" (
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

-- CreateTable
CREATE TABLE "subscription_history" (
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

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plan_slug_key" ON "subscription_plan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plan_stripePriceIdMonthly_key" ON "subscription_plan"("stripePriceIdMonthly");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plan_stripePriceIdYearly_key" ON "subscription_plan"("stripePriceIdYearly");

-- CreateIndex
CREATE INDEX "subscription_plan_isActive_idx" ON "subscription_plan"("isActive");

-- CreateIndex
CREATE INDEX "subscription_plan_slug_idx" ON "subscription_plan"("slug");

-- CreateIndex
CREATE INDEX "user_subscription_userId_idx" ON "user_subscription"("userId");

-- CreateIndex
CREATE INDEX "user_subscription_status_idx" ON "user_subscription"("status");

-- CreateIndex
CREATE INDEX "user_subscription_planId_idx" ON "user_subscription"("planId");

-- CreateIndex
CREATE INDEX "user_subscription_stripeSubscriptionId_idx" ON "user_subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscription_stripeSubscriptionId_key" ON "user_subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoiceNumber_key" ON "invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_stripePaymentIntentId_key" ON "invoice"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_stripeInvoiceId_key" ON "invoice"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "invoice_userId_idx" ON "invoice"("userId");

-- CreateIndex
CREATE INDEX "invoice_subscriptionId_idx" ON "invoice"("subscriptionId");

-- CreateIndex
CREATE INDEX "invoice_paymentStatus_idx" ON "invoice"("paymentStatus");

-- CreateIndex
CREATE INDEX "invoice_invoiceNumber_idx" ON "invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoice_createdAt_idx" ON "invoice"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_code_key" ON "coupon"("code");

-- CreateIndex
CREATE INDEX "coupon_code_idx" ON "coupon"("code");

-- CreateIndex
CREATE INDEX "coupon_isActive_idx" ON "coupon"("isActive");

-- CreateIndex
CREATE INDEX "coupon_validFrom_validUntil_idx" ON "coupon"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "subscription_history_userId_idx" ON "subscription_history"("userId");

-- CreateIndex
CREATE INDEX "subscription_history_subscriptionId_idx" ON "subscription_history"("subscriptionId");

-- CreateIndex
CREATE INDEX "subscription_history_action_idx" ON "subscription_history"("action");

-- CreateIndex
CREATE INDEX "subscription_history_createdAt_idx" ON "subscription_history"("createdAt");

-- AddForeignKey
ALTER TABLE "user_subscription" ADD CONSTRAINT "user_subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscription" ADD CONSTRAINT "user_subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "user_subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_history" ADD CONSTRAINT "subscription_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_history" ADD CONSTRAINT "subscription_history_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "user_subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_history" ADD CONSTRAINT "subscription_history_oldPlanId_fkey" FOREIGN KEY ("oldPlanId") REFERENCES "subscription_plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_history" ADD CONSTRAINT "subscription_history_newPlanId_fkey" FOREIGN KEY ("newPlanId") REFERENCES "subscription_plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

