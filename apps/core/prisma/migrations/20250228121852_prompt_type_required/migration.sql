/*
  Warnings:

  - Made the column `type` on table `Prompt` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Prompt" ALTER COLUMN "type" SET NOT NULL;
