import { redirect } from 'next/navigation'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { PageShell } from '@/components/page-shell'
import { getCurrentSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'

import JudgeRound1Client from './JudgeRound1Client'

const s3 = new S3Client({
  region: process.env.AWS_REGION,
})

export default async function JudgeRound1Page() {
  const session = await getCurrentSession()

  if (!session?.user) {
    redirect('/login')
  }

  const videos = await prisma.videoSubmission.findMany({
    where: {
      isQualified: true,
      processedS3Key: {
        not: null,
      },
      judgeRound1Scores: {
        none: {},
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  const videosWithSignedUrls = await Promise.all(
    videos.map(async (video) => {
      if (!video.processedS3Key) {
        return {
          ...video,
          videoUrl: null,
        }
      }

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
      <JudgeRound1Client initialVideos={videosWithSignedUrls} />
    </PageShell>
  )
}