/*
  Warnings:

  - You are about to drop the column `languageModelId` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `languageModelId` on the `PromptVersion` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Prompt" DROP CONSTRAINT "Prompt_languageModelId_fkey";

-- DropForeignKey
ALTER TABLE "PromptVersion" DROP CONSTRAINT "PromptVersion_languageModelId_fkey";

-- AlterTable
ALTER TABLE "Prompt" DROP COLUMN "languageModelId";

-- AlterTable
ALTER TABLE "PromptVersion" DROP COLUMN "languageModelId";
