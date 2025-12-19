-- CreateEnum
CREATE TYPE "public"."PromptChatMessageRole" AS ENUM ('SYSTEM', 'HUMAN', 'AI', 'TOOL');

-- AlterTable
ALTER TABLE "public"."PromptChatMessage" ADD COLUMN     "role" "public"."PromptChatMessageRole";
