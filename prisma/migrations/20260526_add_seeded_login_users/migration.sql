CREATE TABLE "SeededLoginUser" (
  "id" TEXT NOT NULL,
  "firstName" TEXT,
  "lastName" TEXT,
  "bac" TEXT NOT NULL,
  "gmin" TEXT NOT NULL,
  "district" TEXT,
  "zone" TEXT,
  "region" TEXT,
  "role" TEXT NOT NULL DEFAULT 'uploader',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SeededLoginUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SeededLoginUser_gmin_key" ON "SeededLoginUser"("gmin");
CREATE INDEX "SeededLoginUser_bac_idx" ON "SeededLoginUser"("bac");
CREATE INDEX "SeededLoginUser_district_idx" ON "SeededLoginUser"("district");
CREATE INDEX "SeededLoginUser_zone_idx" ON "SeededLoginUser"("zone");
CREATE INDEX "SeededLoginUser_region_idx" ON "SeededLoginUser"("region");