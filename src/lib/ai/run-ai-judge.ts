import { PrismaClient } from '@prisma/client'

import { runPegasus } from './pegasus'

type RunAiJudgeParams = {
  submissionId: string
}

const prisma = new PrismaClient()

export async function runAiJudge({ submissionId }: RunAiJudgeParams) {
  const outputBucket = process.env.AWS_VIDEO_OUTPUT_BUCKET

  if (!outputBucket) throw new Error('Missing AWS_VIDEO_OUTPUT_BUCKET')

  const submission = await prisma.videoSubmission.findUnique({
    where: { id: submissionId },
    include: { user: true },
  })

  if (!submission) throw new Error(`Submission not found: ${submissionId}`)
  if (!submission.processedS3Key) {
    throw new Error(`Submission ${submissionId} is missing processedS3Key`)
  }

  const aiScore = await prisma.aiJudgeScore.create({
    data: {
      videoSubmissionId: submission.id,
      status: 'analyzing_video',
    },
  })

  const videoS3Uri = `s3://${outputBucket}/${submission.processedS3Key}`

  try {
    const pegasusResult = await runPegasus({ videoS3Uri })

    const updated = await prisma.aiJudgeScore.update({
      where: { id: aiScore.id },
      data: {
        status: 'video_analyzed',
        storyboard: pegasusResult.storyboard,
        transcript: null,
        rawResponse: {
          pegasus: pegasusResult.rawResponse,
          pegasusModel: pegasusResult.modelId,
        },
      },
    })

    return {
      aiJudgeScoreId: updated.id,
      submissionId: submission.id,
      videoS3Uri,
      storyboard: updated.storyboard,
      status: updated.status,
    }
  } catch (error) {
    await prisma.aiJudgeScore.update({
      where: { id: aiScore.id },
      data: {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    })

    throw error
  }
}