/*
  Warnings:

  - You are about to drop the column `languageModelId` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `rawValue` on the `Prompt` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Branch" AS ENUM ('STAGING', 'MASTER');

-- DropForeignKey
ALTER TABLE "Prompt" DROP CONSTRAINT "Prompt_languageModelId_fkey";

-- AlterTable
ALTER TABLE "Prompt" DROP COLUMN "languageModelId",
DROP COLUMN "rawValue";

-- CreateTable
CREATE TABLE "PromptVersion" (
    "id" SERIAL NOT NULL,
    "promptId" INTEGER NOT NULL,
    "branch" "Branch" NOT NULL DEFAULT 'STAGING',
    "commitHash" TEXT NOT NULL,
    "commitMsg" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "languageModelId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_languageModelId_fkey" FOREIGN KEY ("languageModelId") REFERENCES "LanguageModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
