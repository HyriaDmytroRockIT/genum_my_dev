-- DropForeignKey
ALTER TABLE "OrganizationQuota" DROP CONSTRAINT "OrganizationQuota_organizationId_fkey";

-- AddForeignKey
ALTER TABLE "OrganizationQuota" ADD CONSTRAINT "OrganizationQuota_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
