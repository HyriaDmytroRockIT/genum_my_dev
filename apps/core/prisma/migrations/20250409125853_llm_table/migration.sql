/*
  Warnings:

  - You are about to drop the column `provider` on the `LanguageModel` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[vendor,name]` on the table `LanguageModel` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "LanguageModel" DROP COLUMN "provider",
ADD COLUMN     "vendor" "AiVendor" NOT NULL DEFAULT 'OPENAI';

-- CreateIndex
CREATE UNIQUE INDEX "LanguageModel_vendor_name_key" ON "LanguageModel"("vendor", "name");
