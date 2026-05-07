ALTER TABLE "User"
ADD COLUMN "district" INTEGER;

CREATE TABLE "UserDistrictLookup" (
  "email" TEXT NOT NULL,
  "district" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserDistrictLookup_pkey" PRIMARY KEY ("email")
);