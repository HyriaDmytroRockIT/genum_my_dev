/*
  Warnings:

  - You are about to drop the column `endpoint` on the `TestCase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN "endpoint";

-- CreateTable
CREATE TABLE "PromptApiKey" (
    "id" SERIAL NOT NULL,
    "promptId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromptApiKey_key_key" ON "PromptApiKey"("key");

-- AddForeignKey
ALTER TABLE "PromptApiKey" ADD CONSTRAINT "PromptApiKey_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
