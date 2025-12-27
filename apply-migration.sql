-- Quick fix: Apply this SQL directly to your database
-- This will create the course_rating_reaction table

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

-- CreateTable
CREATE TABLE IF NOT EXISTS "course_rating_reaction" (
    "id" TEXT NOT NULL,
    "ratingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reaction" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_rating_reaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (only if they don't exist)
CREATE UNIQUE INDEX IF NOT EXISTS "course_rating_reaction_ratingId_userId_key" 
  ON "course_rating_reaction"("ratingId", "userId");

CREATE INDEX IF NOT EXISTS "course_rating_reaction_ratingId_idx" 
  ON "course_rating_reaction"("ratingId");

CREATE INDEX IF NOT EXISTS "course_rating_reaction_userId_idx" 
  ON "course_rating_reaction"("userId");

-- AddForeignKey (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'course_rating_reaction_ratingId_fkey'
  ) THEN
    ALTER TABLE "course_rating_reaction" 
    ADD CONSTRAINT "course_rating_reaction_ratingId_fkey" 
    FOREIGN KEY ("ratingId") REFERENCES "course_rating"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'course_rating_reaction_userId_fkey'
  ) THEN
    ALTER TABLE "course_rating_reaction" 
    ADD CONSTRAINT "course_rating_reaction_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "user"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

