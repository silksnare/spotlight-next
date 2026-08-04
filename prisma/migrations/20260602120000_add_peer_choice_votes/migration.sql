-- CreateTable
CREATE TABLE "PeerChoiceVote" (
    "id" TEXT NOT NULL,
    "voterUserId" TEXT NOT NULL,
    "videoSubmissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeerChoiceVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PeerChoiceVote_voterUserId_key" ON "PeerChoiceVote"("voterUserId");

-- CreateIndex
CREATE INDEX "PeerChoiceVote_videoSubmissionId_idx" ON "PeerChoiceVote"("videoSubmissionId");

-- AddForeignKey
ALTER TABLE "PeerChoiceVote" ADD CONSTRAINT "PeerChoiceVote_voterUserId_fkey" FOREIGN KEY ("voterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeerChoiceVote" ADD CONSTRAINT "PeerChoiceVote_videoSubmissionId_fkey" FOREIGN KEY ("videoSubmissionId") REFERENCES "VideoSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed Vote phase after Judge Round 2.
INSERT INTO "Phase" ("id", "key", "label", "startsAt", "endsAt", "isActive")
VALUES (
    'phase_vote',
    'vote',
    'Vote',
    '2026-07-01 05:00:00.000',
    '2026-07-16 04:59:59.000',
    false
)
ON CONFLICT ("key") DO UPDATE SET
    "label" = EXCLUDED."label",
    "startsAt" = EXCLUDED."startsAt",
    "endsAt" = EXCLUDED."endsAt";
