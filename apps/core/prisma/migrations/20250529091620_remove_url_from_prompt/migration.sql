/*
  Warnings:

  - You are about to drop the column `url` on the `Prompt` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Prompt_url_key";

-- AlterTable
ALTER TABLE "Prompt" DROP COLUMN "url";
