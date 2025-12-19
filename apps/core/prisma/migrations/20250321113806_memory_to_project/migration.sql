/*
  Warnings:

  - Made the column `authID` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Memory" ADD COLUMN     "promptId" INTEGER;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "authID" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
