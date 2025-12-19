-- CreateEnum
CREATE TYPE "TestCaseStatus" AS ENUM ('OK', 'NOK', 'PENDING', 'NEED_RUN', 'FAILED');

-- AlterEnum
ALTER TYPE "AssertionType" ADD VALUE 'MANUAL';

-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "assertion_result" TEXT DEFAULT '',
ADD COLUMN     "assertion_thoughts" TEXT DEFAULT '',
ADD COLUMN     "status" "TestCaseStatus" NOT NULL DEFAULT 'NEED_RUN';
