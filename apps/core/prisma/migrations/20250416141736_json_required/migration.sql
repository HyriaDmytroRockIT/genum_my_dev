/*
  Warnings:

  - Made the column `languageModelConfig` on table `Prompt` required. This step will fail if there are existing NULL values in that column.
  - Made the column `languageModelConfig` on table `PromptVersion` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Prompt" ALTER COLUMN "languageModelConfig" SET NOT NULL;

-- AlterTable
ALTER TABLE "PromptVersion" ALTER COLUMN "languageModelConfig" SET NOT NULL;
