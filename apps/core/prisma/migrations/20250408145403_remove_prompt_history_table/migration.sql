/*
  Warnings:

  - You are about to drop the `RequestHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RequestHistory" DROP CONSTRAINT "RequestHistory_promptId_fkey";

-- DropTable
DROP TABLE "RequestHistory";
