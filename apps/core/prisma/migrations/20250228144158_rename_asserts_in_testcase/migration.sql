/*
  Warnings:

  - You are about to drop the column `assertion_result` on the `TestCase` table. All the data in the column will be lost.
  - You are about to drop the column `assertion_thoughts` on the `TestCase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN "assertion_result",
DROP COLUMN "assertion_thoughts",
ADD COLUMN     "assertionResult" TEXT DEFAULT '',
ADD COLUMN     "assertionThoughts" TEXT DEFAULT '';
