-- CreateEnum
CREATE TYPE "PromptType" AS ENUM ('MAIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AssertionType" AS ENUM ('STRICT', 'AI');

-- AlterTable
ALTER TABLE "Prompt" ALTER COLUMN "type" SET DATA TYPE TEXT;
