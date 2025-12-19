-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "expectedChainOfThoughts" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "languageModelId" INTEGER,
ADD COLUMN     "lastChainOfThoughts" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "LanguageModel" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "provider" VARCHAR(255) NOT NULL,
    "promptPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completionPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contextTokensMax" INTEGER NOT NULL DEFAULT 0,
    "completionTokensMax" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LanguageModel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_languageModelId_fkey" FOREIGN KEY ("languageModelId") REFERENCES "LanguageModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
