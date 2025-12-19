/*
  Warnings:

  - You are about to drop the column `url` on the `OrganizationInvitation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `OrganizationInvitation` will be added. If there are existing duplicate values, this will fail.
  - The required column `token` was added to the `OrganizationInvitation` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "OrganizationInvitation_url_key";

-- AlterTable
ALTER TABLE "OrganizationInvitation" DROP COLUMN "url",
ADD COLUMN     "accepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "token" TEXT NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationInvitation_token_key" ON "OrganizationInvitation"("token");
