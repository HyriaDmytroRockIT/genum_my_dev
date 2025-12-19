/*
  Warnings:

  - You are about to drop the column `expectedChainOfThoughts` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `expectedOutput` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `lastChainOfThoughts` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `lastOutput` on the `Prompt` table. All the data in the column will be lost.
  - You are about to drop the column `context` on the `Ticket` table. All the data in the column will be lost.
  - Added the required column `name` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `promptId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Prompt" DROP COLUMN "expectedChainOfThoughts",
DROP COLUMN "expectedOutput",
DROP COLUMN "lastChainOfThoughts",
DROP COLUMN "lastOutput";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "context",
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "input" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "name" VARCHAR(255) NOT NULL,
ADD COLUMN     "output" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "promptId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
