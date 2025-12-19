-- DropForeignKey
ALTER TABLE "PromptVersion" DROP CONSTRAINT "PromptVersion_languageModelId_fkey";

-- AlterTable
ALTER TABLE "PromptVersion" ALTER COLUMN "languageModelId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_languageModelId_fkey" FOREIGN KEY ("languageModelId") REFERENCES "LanguageModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
