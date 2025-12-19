-- CreateTable
CREATE TABLE "OrganizationQuota" (
    "id" SERIAL NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "OrganizationQuota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationQuota_organizationId_key" ON "OrganizationQuota"("organizationId");

-- AddForeignKey
ALTER TABLE "OrganizationQuota" ADD CONSTRAINT "OrganizationQuota_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Создаем квоты для всех существующих организаций
INSERT INTO "OrganizationQuota" ("organizationId", "balance", "createdAt", "updatedAt")
SELECT 
    id, 
    CASE 
        WHEN personal = true THEN 10.0 
        ELSE 0.0 
    END as balance,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Organization";