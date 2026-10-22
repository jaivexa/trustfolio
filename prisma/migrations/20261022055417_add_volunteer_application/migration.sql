-- CreateEnum
CREATE TYPE "VolunteerApplicationStatus" AS ENUM ('PENDING', 'REVIEWING', 'CONTACTED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "VolunteerApplication" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "availability" TEXT,
    "message" TEXT,
    "status" "VolunteerApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VolunteerApplication_email_idx" ON "VolunteerApplication"("email");

-- CreateIndex
CREATE INDEX "VolunteerApplication_status_createdAt_idx" ON "VolunteerApplication"("status", "createdAt");

-- CreateIndex
CREATE INDEX "VolunteerApplication_isDeleted_createdAt_idx" ON "VolunteerApplication"("isDeleted", "createdAt");
