ALTER TABLE "VideoSubmission"
ADD COLUMN "disqualificationReasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "disqualificationOther" TEXT,
ADD COLUMN "disqualifiedAt" TIMESTAMP(3),
ADD COLUMN "disqualifiedBy" TEXT;