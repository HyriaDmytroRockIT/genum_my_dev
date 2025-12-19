-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


-- Then update the enum type
ALTER TYPE "AiVendor" ADD VALUE 'GOOGLE';
ALTER TYPE "AiVendor" ADD VALUE 'ANTHROPIC';
