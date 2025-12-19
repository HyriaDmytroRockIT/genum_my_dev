-- CreateTable
CREATE TABLE "PromptChat" (
    "id" SERIAL NOT NULL,
    "promptId" INTEGER NOT NULL,
    "thread_id" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptChat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromptChat_promptId_key" ON "PromptChat"("promptId");

-- AddForeignKey
ALTER TABLE "PromptChat" ADD CONSTRAINT "PromptChat_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
