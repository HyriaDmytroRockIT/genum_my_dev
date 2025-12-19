/*
  Warnings:

  - You are about to drop the column `branch` on the `PromptVersion` table. All the data in the column will be lost.
  - You are about to drop the column `promptId` on the `PromptVersion` table. All the data in the column will be lost.
  - You are about to drop the column `promptValue` on the `TestCase` table. All the data in the column will be lost.
  - You are about to drop the column `promptVersion` on the `TestCase` table. All the data in the column will be lost.
  - You are about to drop the column `keycloakID` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PromptVersion" DROP CONSTRAINT "PromptVersion_promptId_fkey";

-- AlterTable
ALTER TABLE "PromptVersion" DROP COLUMN "branch",
DROP COLUMN "promptId",
ADD COLUMN     "branchId" INTEGER;

-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN "promptValue",
DROP COLUMN "promptVersion";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "keycloakID";

-- CreateTable
CREATE TABLE "Branch" (
    "id" SERIAL NOT NULL,
    "promptId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_promptId_name_key" ON "Branch"("promptId", "name");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
