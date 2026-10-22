/*
  Warnings:

  - Added the required column `goals` to the `VolunteerApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motivation` to the `VolunteerApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VolunteerApplication" ADD COLUMN     "activityId" TEXT,
ADD COLUMN     "goals" TEXT NOT NULL,
ADD COLUMN     "motivation" TEXT NOT NULL,
ADD COLUMN     "remarks" TEXT;

-- CreateIndex
CREATE INDEX "VolunteerApplication_activityId_status_createdAt_idx" ON "VolunteerApplication"("activityId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "VolunteerApplication" ADD CONSTRAINT "VolunteerApplication_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
