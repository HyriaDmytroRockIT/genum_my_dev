-- CreateTable
CREATE TABLE "PromptChatMessage" (
    "id" SERIAL NOT NULL,
    "promptChatId" INTEGER NOT NULL,
    "message" JSONB NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptChatMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PromptChatMessage" ADD CONSTRAINT "PromptChatMessage_promptChatId_fkey" FOREIGN KEY ("promptChatId") REFERENCES "PromptChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
