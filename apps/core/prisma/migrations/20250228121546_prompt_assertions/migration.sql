-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "assertionType" "AssertionType" NOT NULL DEFAULT 'STRICT',
ADD COLUMN     "assertionValue" TEXT DEFAULT '';
