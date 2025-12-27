-- Add new fields to subscription_plan table
-- Migration: add_subscription_plan_new_features

ALTER TABLE "subscription_plan" 
ADD COLUMN IF NOT EXISTS "maxLiveQASessions" INTEGER,
ADD COLUMN IF NOT EXISTS "allowsTeamManagement" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "maxPrioritySupportTickets" INTEGER,
ADD COLUMN IF NOT EXISTS "allowsProgressTracking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "allowsCommunitySupport" BOOLEAN NOT NULL DEFAULT false;

-- Add comments for clarity
COMMENT ON COLUMN "subscription_plan"."maxLiveQASessions" IS 'Maximum number of live Q&A sessions allowed per month. NULL means unlimited.';
COMMENT ON COLUMN "subscription_plan"."allowsTeamManagement" IS 'Enable team management features';
COMMENT ON COLUMN "subscription_plan"."maxPrioritySupportTickets" IS 'Maximum number of priority support tickets allowed per month. NULL means unlimited.';
COMMENT ON COLUMN "subscription_plan"."allowsProgressTracking" IS 'Enable basic progress tracking feature';
COMMENT ON COLUMN "subscription_plan"."allowsCommunitySupport" IS 'Enable community support feature';

