/*
  Warnings:

  - The `type` column on the `Prompt` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Prompt" DROP COLUMN "type",
ADD COLUMN     "type" "PromptType" DEFAULT 'MAIN';
