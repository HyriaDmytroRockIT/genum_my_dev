-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "languageModelId" INTEGER;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_languageModelId_fkey" FOREIGN KEY ("languageModelId") REFERENCES "LanguageModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
