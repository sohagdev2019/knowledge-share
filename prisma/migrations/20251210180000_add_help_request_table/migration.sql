-- CreateEnum
CREATE TYPE "HelpRequestStatus" AS ENUM ('Pending', 'InProgress', 'Resolved', 'Closed');

-- CreateEnum
CREATE TYPE "HelpRequestUserType" AS ENUM ('Teacher', 'Student', 'Admin');

-- CreateTable
CREATE TABLE "help_request" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "userType" "HelpRequestUserType" NOT NULL,
    "status" "HelpRequestStatus" NOT NULL DEFAULT 'Pending',
    "response" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "help_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "help_request_userId_idx" ON "help_request"("userId");

-- CreateIndex
CREATE INDEX "help_request_status_idx" ON "help_request"("status");

-- CreateIndex
CREATE INDEX "help_request_createdAt_idx" ON "help_request"("createdAt");

-- CreateIndex
CREATE INDEX "help_request_userType_idx" ON "help_request"("userType");

-- AddForeignKey
ALTER TABLE "help_request" ADD CONSTRAINT "help_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
