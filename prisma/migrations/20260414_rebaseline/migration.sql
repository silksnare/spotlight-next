-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "homeArea" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loggedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,

    CONSTRAINT "LoginEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "storedFileName" TEXT NOT NULL,
    "rawS3Key" TEXT NOT NULL,
    "processedS3Key" TEXT,
    "uploadStatus" TEXT NOT NULL,
    "processingStatus" TEXT NOT NULL,
    "mediaConvertJobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isQualified" BOOLEAN,
    "qualifiedAt" TIMESTAMP(3),
    "qualifiedBy" TEXT,
    "homeArea" INTEGER,

    CONSTRAINT "VideoSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JudgeRound1Score" (
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

    CONSTRAINT "JudgeRound1Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- CreateIndex
CREATE INDEX "LoginEvent_userId_loggedInAt_idx" ON "LoginEvent"("userId", "loggedInAt");

-- CreateIndex
CREATE UNIQUE INDEX "Phase_key_key" ON "Phase"("key");

-- CreateIndex
CREATE UNIQUE INDEX "VideoSubmission_userId_key" ON "VideoSubmission"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoSubmission_rawS3Key_key" ON "VideoSubmission"("rawS3Key");

-- CreateIndex
CREATE INDEX "VideoSubmission_uploadStatus_idx" ON "VideoSubmission"("uploadStatus");

-- CreateIndex
CREATE INDEX "VideoSubmission_processingStatus_idx" ON "VideoSubmission"("processingStatus");

-- CreateIndex
CREATE INDEX "VideoSubmission_isQualified_idx" ON "VideoSubmission"("isQualified");

-- CreateIndex
CREATE INDEX "VideoSubmission_homeArea_idx" ON "VideoSubmission"("homeArea");

-- CreateIndex
CREATE INDEX "JudgeRound1Score_judgeUserId_idx" ON "JudgeRound1Score"("judgeUserId");

-- CreateIndex
CREATE INDEX "JudgeRound1Score_videoSubmissionId_idx" ON "JudgeRound1Score"("videoSubmissionId");

-- CreateIndex
CREATE UNIQUE INDEX "JudgeRound1Score_videoSubmissionId_judgeUserId_key" ON "JudgeRound1Score"("videoSubmissionId", "judgeUserId");

-- AddForeignKey
ALTER TABLE "LoginEvent" ADD CONSTRAINT "LoginEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoSubmission" ADD CONSTRAINT "VideoSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeRound1Score" ADD CONSTRAINT "JudgeRound1Score_judgeUserId_fkey" FOREIGN KEY ("judgeUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeRound1Score" ADD CONSTRAINT "JudgeRound1Score_videoSubmissionId_fkey" FOREIGN KEY ("videoSubmissionId") REFERENCES "VideoSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
