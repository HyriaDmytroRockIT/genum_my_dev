-- AlterTable
ALTER TABLE "PromptChat" ALTER COLUMN "thread_id" DROP NOT NULL,
ALTER COLUMN "thread_id" DROP DEFAULT;
