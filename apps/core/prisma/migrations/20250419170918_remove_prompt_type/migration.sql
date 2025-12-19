/*
  Warnings:

  - You are about to drop the column `type` on the `Prompt` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Prompt" DROP COLUMN "type";

-- DropEnum
DROP TYPE "PromptType";
