CREATE TABLE "JudgeRound2Score" (
  "id" TEXT NOT NULL,
  "videoSubmissionId" TEXT NOT NULL,
  "judgeUserId" TEXT NOT NULL,

  "introductionGuestContext" DECIMAL(4,2) NOT NULL,
  "explanationOfInspectionFindings" DECIMAL(4,2) NOT NULL,
  "serviceRecommendationUrgency" DECIMAL(4,2) NOT NULL,
  "communicationClarityProfessionalism" DECIMAL(4,2) NOT NULL,
  "organizationVideoFlow" DECIMAL(4,2) NOT NULL,
  "accuracyOfRecommendations" DECIMAL(4,2) NOT NULL,

  "totalScore" DECIMAL(5,2) NOT NULL,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "JudgeRound2Score_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JudgeRound2Score_videoSubmissionId_judgeUserId_key"
ON "JudgeRound2Score"("videoSubmissionId", "judgeUserId");

CREATE INDEX "JudgeRound2Score_judgeUserId_idx"
ON "JudgeRound2Score"("judgeUserId");

CREATE INDEX "JudgeRound2Score_videoSubmissionId_idx"
ON "JudgeRound2Score"("videoSubmissionId");