/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `Prompt` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Prompt" ALTER COLUMN "url" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "RequestHistory" ADD COLUMN     "memoryId" INTEGER;

-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "memoryId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Prompt_url_key" ON "Prompt"("url");

-- AddForeignKey
ALTER TABLE "RequestHistory" ADD CONSTRAINT "RequestHistory_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
