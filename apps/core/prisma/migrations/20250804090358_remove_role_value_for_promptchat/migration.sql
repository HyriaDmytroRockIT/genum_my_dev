/*
  Warnings:

  - You are about to drop the column `role` on the `PromptChatMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."PromptChatMessage" DROP COLUMN "role";

-- DropEnum
DROP TYPE "public"."PromptChatMessageRole";
