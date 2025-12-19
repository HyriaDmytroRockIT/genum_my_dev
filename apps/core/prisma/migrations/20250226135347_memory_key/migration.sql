/*
  Warnings:

  - You are about to drop the column `memoryId` on the `RequestHistory` table. All the data in the column will be lost.
  - You are about to drop the column `memoryId` on the `TestCase` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "RequestHistory" DROP CONSTRAINT "RequestHistory_memoryId_fkey";

-- DropForeignKey
ALTER TABLE "TestCase" DROP CONSTRAINT "TestCase_memoryId_fkey";

-- AlterTable
ALTER TABLE "RequestHistory" DROP COLUMN "memoryId",
ADD COLUMN     "memoryKey" TEXT;

-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN "memoryId",
ADD COLUMN     "memoryKey" TEXT;
