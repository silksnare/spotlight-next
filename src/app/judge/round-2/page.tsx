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

const VIDEOS_PER_REGION = 5

type Round2Video = {
  id: string
  processedS3Key: string
  originalFileName: string
  district: number | null
  homeArea: number | null
  round1ScoreId: string
  round1TotalScore: string
  user: {
    email: string
    homeArea: number | null
    displayName: string | null
    firstName: string | null
    lastName: string | null
  }
}

export default async function JudgeRound2Page() {
  const session = await getCurrentSession()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'judge2' && session.user.role !== 'admin') {
    redirect('/unauthorized')
  }

  /*
   * Retrieve all eligible Round 1 scores.
   *
   * Do not remove videos already judged by the current Round 2 judge here.
   * The original top five videos for each region must be determined first.
   */
  const scores = await prisma.judgeRound1Score.findMany({
    where: {
      videoSubmission: {
        processedS3Key: {
          not: null,
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

  /*
   * Establish the original Round 2 field.
   *
   * This always selects the same top five submissions from each region,
   * regardless of which videos the current judge has already scored.
   */
  const originalWinners: Round2Video[] = []
  const regionCounts = new Map<number, number>()
  const selectedVideoIds = new Set<string>()

  for (const row of scores) {
    const video = row.videoSubmission
    const region = video.homeArea

    if (region == null || !video.processedS3Key) {
      continue
    }

    /*
     * A submission may have multiple Round 1 score records.
     * Prevent it from occupying multiple positions in the top five.
     */
    if (selectedVideoIds.has(video.id)) {
      continue
    }

    const currentCount = regionCounts.get(region) ?? 0

    if (currentCount >= VIDEOS_PER_REGION) {
      continue
    }

    selectedVideoIds.add(video.id)
    regionCounts.set(region, currentCount + 1)

    originalWinners.push({
      id: video.id,
      processedS3Key: video.processedS3Key,
      originalFileName: video.originalFileName,
      district: video.district,
      homeArea: video.homeArea,
      round1ScoreId: row.id,
      round1TotalScore: row.totalScore.toString(),
      user: {
        email: video.user.email,
        homeArea: video.homeArea,
        displayName: video.user.displayName,
        firstName: video.user.firstName,
        lastName: video.user.lastName,
      },
    })
  }

  /*
   * Find the videos from the original Round 2 field that the current
   * judge has already scored.
   */
  const existingRound2Scores =
    originalWinners.length > 0
      ? await prisma.judgeRound2Score.findMany({
          where: {
            judgeUserId: session.user.id,
            videoSubmissionId: {
              in: originalWinners.map((video) => video.id),
            },
          },
          select: {
            videoSubmissionId: true,
          },
        })
      : []

  const judgedVideoIds = new Set(
    existingRound2Scores.map((score) => score.videoSubmissionId),
  )

  /*
   * Remove judged videos only after the original top 25 have been selected.
   *
   * This prevents the next-highest Round 1 submission from being pulled into
   * the list when a judge submits a Round 2 score and the page refreshes.
   */
  const remainingWinners = originalWinners.filter(
    (video) => !judgedVideoIds.has(video.id),
  )

  const videosWithSignedUrls = await Promise.all(
    remainingWinners.map(async (video) => {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_VIDEO_OUTPUT_BUCKET,
        Key: video.processedS3Key,
      })

      const videoUrl = await getSignedUrl(s3, command, {
        expiresIn: 604800,
      })

      return {
        ...video,
        videoUrl,
      }
    }),
  )

  return (
    <PageShell>
      <JudgeRound2Client
        judgeRegion={null}
        targetRegion={null}
        initialVideos={videosWithSignedUrls}
      />
    </PageShell>
  )
}