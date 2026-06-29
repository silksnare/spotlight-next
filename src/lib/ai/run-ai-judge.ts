import { PrismaClient } from '@prisma/client'

import { runPegasus } from './pegasus'
import { runClaudeJudge } from './claude'

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

      await prisma.aiJudgeScore.update({
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

      const claudeResult = await runClaudeJudge({
        pegasusOutput: pegasusResult.storyboard,
      })

      const result = claudeResult.result

      const updated = await prisma.aiJudgeScore.update({
        where: { id: aiScore.id },
        data: {
          status: 'completed',
          criterion1Score: result.criterion1Score,
          criterion2Score: result.criterion2Score,
          criterion3Score: result.criterion3Score,
          criterion4Score: result.criterion4Score,
          criterion5Score: result.criterion5Score,
          criterion6Score: result.criterion6Score,
          totalScore: result.totalScore,
          overallComment: result.overallComment,
          improvementNotes: result.improvementNotes,
          rawResponse: {
            pegasus: pegasusResult.rawResponse,
            pegasusModel: pegasusResult.modelId,
            claude: claudeResult.rawResponse,
            claudeModel: claudeResult.modelId,
            claudeParsed: result,
          },
        },
      })

      return {
        aiJudgeScoreId: updated.id,
        submissionId: submission.id,
        videoS3Uri,
        storyboard: updated.storyboard,
        totalScore: updated.totalScore?.toString(),
        status: updated.status,
      }
    } catch (error) {