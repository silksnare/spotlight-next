import { redirect } from 'next/navigation'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { PageShell } from '@/components/page-shell'
import { getCurrentSession } from '@/lib/auth/session'
import { isPhaseActiveFromDb } from '@/lib/phases/is-phase-active-from-db'
import { prisma } from '@/lib/prisma'
import { getEligibleVoteCandidates, VOTE_PHASE_KEY } from '@/lib/vote/candidates'

import VoteClient from './VoteClient'

const s3 = new S3Client({
  region: process.env.AWS_REGION,
})

export default async function VotePage() {
  const session = await getCurrentSession()

  if (!session?.user) {
    redirect('/login')
  }

  const votePhaseActive = await isPhaseActiveFromDb(VOTE_PHASE_KEY)

  if (!votePhaseActive) {
    redirect('/dashboard')
  }

  const [candidates, currentVote] = await Promise.all([
    getEligibleVoteCandidates(),
    prisma.peerChoiceVote.findUnique({
      where: {
        voterUserId: session.user.id,
      },
      select: {
        videoSubmissionId: true,
      },
    }),
  ])

  const candidatesWithSignedUrls = await Promise.all(
    candidates.map(async (candidate) => {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_VIDEO_OUTPUT_BUCKET,
        Key: candidate.processedS3Key,
      })

      const videoUrl = await getSignedUrl(s3, command, {
        expiresIn: 604800,
      })

      return {
        ...candidate,
        videoUrl,
      }
    })
  )

  return (
    <PageShell>
      <VoteClient
        initialCandidates={candidatesWithSignedUrls}
        initialSelectedVideoId={currentVote?.videoSubmissionId ?? null}
      />
    </PageShell>
  )
}
