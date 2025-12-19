/*
  Warnings:

  - You are about to drop the column `memoryKey` on the `TestCase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN "memoryKey",
ADD COLUMN     "memoryId" INTEGER;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
