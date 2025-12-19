/*
  Warnings:

  - The values [GEMINI] on the enum `AiVendor` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AiVendor_new" AS ENUM ('OPENAI', 'GOOGLE', 'ANTHROPIC');
ALTER TABLE "LanguageModel" ALTER COLUMN "vendor" DROP DEFAULT;
ALTER TABLE "OrganizationApiKey" ALTER COLUMN "vendor" TYPE "AiVendor_new" USING ("vendor"::text::"AiVendor_new");
ALTER TABLE "LanguageModel" ALTER COLUMN "vendor" TYPE "AiVendor_new" USING ("vendor"::text::"AiVendor_new");
ALTER TYPE "AiVendor" RENAME TO "AiVendor_old";
ALTER TYPE "AiVendor_new" RENAME TO "AiVendor";
DROP TYPE "AiVendor_old";
ALTER TABLE "LanguageModel" ALTER COLUMN "vendor" SET DEFAULT 'OPENAI';
COMMIT;
