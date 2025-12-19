-- CreateEnum
CREATE TYPE "AiVendor" AS ENUM ('OPENAI', 'CLAUDE', 'GEMINI', 'ANTHROPIC');

-- CreateTable
CREATE TABLE "OrganizationApiKey" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "vendor" "AiVendor" NOT NULL,
    "key" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationApiKey_organizationId_vendor_key" ON "OrganizationApiKey"("organizationId", "vendor");

-- AddForeignKey
ALTER TABLE "OrganizationApiKey" ADD CONSTRAINT "OrganizationApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
