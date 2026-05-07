ALTER TABLE "VideoSubmission"
ADD COLUMN "district" INTEGER;

CREATE INDEX "VideoSubmission_district_idx"
ON "VideoSubmission" ("district");