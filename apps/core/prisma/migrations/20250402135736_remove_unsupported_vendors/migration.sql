/*
  Warnings:

  - The values [GEMINI,ANTHROPIC] on the enum `AiVendor` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AiVendor_new" AS ENUM ('OPENAI');
ALTER TABLE "OrganizationApiKey" ALTER COLUMN "vendor" TYPE "AiVendor_new" USING ("vendor"::text::"AiVendor_new");
ALTER TYPE "AiVendor" RENAME TO "AiVendor_old";
ALTER TYPE "AiVendor_new" RENAME TO "AiVendor";
DROP TYPE "AiVendor_old";
COMMIT;
