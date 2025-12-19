-- AlterTable
ALTER TABLE "PromptVersion" ADD COLUMN     "audit" JSONB;

-- CreateTable
CREATE TABLE "Audit" (
    "id" SERIAL NOT NULL,
    "promptId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Audit_promptId_key" ON "Audit"("promptId");

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
