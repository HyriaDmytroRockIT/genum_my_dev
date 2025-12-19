/*
  Warnings:

  - Made the column `authorId` on table `ProjectApiKey` required. This step will fail if there are existing NULL values in that column.
  - Made the column `authorId` on table `PromptVersion` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ProjectApiKey" DROP CONSTRAINT "ProjectApiKey_authorId_fkey";

-- DropForeignKey
ALTER TABLE "PromptVersion" DROP CONSTRAINT "PromptVersion_authorId_fkey";

-- AlterTable
ALTER TABLE "ProjectApiKey" ALTER COLUMN "authorId" SET NOT NULL;

-- AlterTable
ALTER TABLE "PromptVersion" ALTER COLUMN "authorId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ProjectApiKey" ADD CONSTRAINT "ProjectApiKey_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
