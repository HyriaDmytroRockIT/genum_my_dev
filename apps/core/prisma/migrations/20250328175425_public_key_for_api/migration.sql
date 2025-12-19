/*
  Warnings:

  - Added the required column `publicKey` to the `ProjectApiKey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectApiKey" ADD COLUMN     "publicKey" TEXT NOT NULL;
