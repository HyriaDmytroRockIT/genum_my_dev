/*
  Warnings:

  - A unique constraint covering the columns `[key,promptId]` on the table `Memory` will be added. If there are existing duplicate values, this will fail.
  - Made the column `promptId` on table `Memory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `projectId` on table `Prompt` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Prompt" DROP CONSTRAINT "Prompt_projectId_fkey";

-- AlterTable
ALTER TABLE "Memory" ALTER COLUMN "promptId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Prompt" ALTER COLUMN "projectId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Memory_key_promptId_key" ON "Memory"("key", "promptId");

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
