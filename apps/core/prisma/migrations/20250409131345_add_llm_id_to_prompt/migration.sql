-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "languageModelId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_languageModelId_fkey" FOREIGN KEY ("languageModelId") REFERENCES "LanguageModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
