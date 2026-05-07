CREATE TABLE "JudgeRound2RegionAssignment" (
  "judgeRegion" INTEGER NOT NULL,
  "targetRegion" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JudgeRound2RegionAssignment_pkey" PRIMARY KEY ("judgeRegion")
);