/*
  Warnings:

  - The `branch` column on the `PromptVersion` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PromptVersion" DROP COLUMN "branch",
ADD COLUMN     "branch" TEXT NOT NULL DEFAULT 'master';

-- DropEnum
DROP TYPE "Branch";
