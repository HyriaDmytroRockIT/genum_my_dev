-- AlterTable
ALTER TABLE "PromptVersion" ADD COLUMN     "languageModelConfig" JSONB DEFAULT '{}',
ADD COLUMN     "languageModelId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_languageModelId_fkey" FOREIGN KEY ("languageModelId") REFERENCES "LanguageModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
