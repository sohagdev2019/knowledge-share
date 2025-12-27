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
CREATE TABLE "course_rating_reaction" (
    "id" TEXT NOT NULL,
    "ratingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reaction" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_rating_reaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_rating_reaction_ratingId_userId_key" ON "course_rating_reaction"("ratingId", "userId");

-- CreateIndex
CREATE INDEX "course_rating_reaction_ratingId_idx" ON "course_rating_reaction"("ratingId");

-- CreateIndex
CREATE INDEX "course_rating_reaction_userId_idx" ON "course_rating_reaction"("userId");

-- AddForeignKey
ALTER TABLE "course_rating_reaction" ADD CONSTRAINT "course_rating_reaction_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "course_rating"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_rating_reaction" ADD CONSTRAINT "course_rating_reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

