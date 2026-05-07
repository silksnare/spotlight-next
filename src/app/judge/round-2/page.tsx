import { redirect } from 'next/navigation'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { PageShell } from '@/components/page-shell'
import { getCurrentSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'

import JudgeRound2Client from './JudgeRound2Client'

const s3 = new S3Client({
  region: process.env.AWS_REGION,
})

export default async function JudgeRound2Page() {
  const session = await getCurrentSession()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'judge2' && session.user.role !== 'admin') {
    redirect('/unauthorized')
  }

  const judgeRegion = session.user.homeArea

  if (judgeRegion == null) {
    return (
      <PageShell>
        <JudgeRound2Client
          judgeRegion={null}
          targetRegion={null}
          initialVideos={[]}
          errorMessage="Judge home area is missing from session."
        />
      </PageShell>
    )
  }

  const assignment = await prisma.judgeRound2RegionAssignment.findUnique({
    where: { judgeRegion },
  })

  if (!assignment) {
    return (
      <PageShell>
        <JudgeRound2Client
          judgeRegion={judgeRegion}
          targetRegion={null}
          initialVideos={[]}
          errorMessage={`No Round 2 region assignment found for judge region ${judgeRegion}.`}
        />
      </PageShell>
    )
  }

  const scores = await prisma.judgeRound1Score.findMany({
    where: {
      videoSubmission: {
        homeArea: assignment.targetRegion,
        judgeRound2Scores: {
          none: {
            judgeUserId: session.user.id,
          },
        },
      },
    },
    orderBy: [{ totalScore: 'desc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      totalScore: true,
      createdAt: true,
      videoSubmission: {
        select: {
          id: true,
          district: true,
          homeArea: true,
          processedS3Key: true,
          originalFileName: true,
          user: {
            select: {
              email: true,
              displayName: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  })

  const winners = []
  const seen = new Set<string>()

  for (const row of scores) {
    const video = row.videoSubmission
    const area = video?.homeArea
    const district = video?.district

    if (area == null || district == null || !video?.processedS3Key) continue

    const key = `${area}-${district}`
    if (seen.has(key)) continue

    seen.add(key)
    winners.push({
      id: video.id,
      processedS3Key: video.processedS3Key,
      originalFileName: video.originalFileName,
      district: video.district,
      homeArea: video.homeArea,
      round1ScoreId: row.id,
      round1TotalScore: row.totalScore.toString(),
      user: {
        email: video.user.email,
        homeArea: video.homeArea ?? null,
        displayName: video.user.displayName,
        firstName: video.user.firstName,
        lastName: video.user.lastName,
      },
    })
  }

  const videosWithSignedUrls = await Promise.all(
    winners.map(async (video) => {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_VIDEO_OUTPUT_BUCKET,
        Key: video.processedS3Key,
      })

      const videoUrl = await getSignedUrl(s3, command, {
        expiresIn: 60 * 15,
      })

      return {
        ...video,
        videoUrl,
      }
    })
  )

  return (
    <PageShell>
      <JudgeRound2Client
        judgeRegion={judgeRegion}
        targetRegion={assignment.targetRegion}
        initialVideos={videosWithSignedUrls}
      />
    </PageShell>
  )
}