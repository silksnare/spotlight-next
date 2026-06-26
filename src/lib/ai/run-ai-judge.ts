import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { PrismaClient } from '@prisma/client'

type RunAiJudgeParams = {
  submissionId: string
}

const prisma = new PrismaClient()

export async function runAiJudge({ submissionId }: RunAiJudgeParams) {
  const region = process.env.AWS_REGION || 'us-east-1'
  const modelId = process.env.AWS_BEDROCK_PEGASUS_MODEL_ID
  const outputBucket = process.env.AWS_VIDEO_OUTPUT_BUCKET
  const bucketOwner = process.env.AWS_ACCOUNT_ID

  if (!modelId) throw new Error('Missing AWS_BEDROCK_PEGASUS_MODEL_ID')
  if (!outputBucket) throw new Error('Missing AWS_VIDEO_OUTPUT_BUCKET')
  if (!bucketOwner) throw new Error('Missing AWS_ACCOUNT_ID')

  const submission = await prisma.videoSubmission.findUnique({
    where: { id: submissionId },
    include: { user: true },
  })

  if (!submission) throw new Error(`Submission not found: ${submissionId}`)
  if (!submission.processedS3Key) throw new Error('Submission is missing processedS3Key')

  const aiScore = await prisma.aiJudgeScore.create({
    data: {
      videoSubmissionId: submission.id,
      status: 'analyzing_video',
    },
  })

  const videoS3Uri = `s3://${outputBucket}/${submission.processedS3Key}`

  const client = new BedrockRuntimeClient({ region })

  const body = {
    inputPrompt:
      'Create a detailed textual storyboard of this vehicle inspection video. Describe the sequence of scenes, what is shown visually, what the speaker explains, any measurements or recommendations mentioned, and any evidence shown on camera.',
    mediaSource: {
      s3Location: {
        uri: videoS3Uri,
        bucketOwner,
      },
    },
    temperature: 0.2,
    maxOutputTokens: 4096,
  }

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(body),
  })

  const response = await client.send(command)
  const responseText = Buffer.from(response.body).toString('utf8')
  const parsed = JSON.parse(responseText)

  const updated = await prisma.aiJudgeScore.update({
    where: { id: aiScore.id },
    data: {
      status: 'video_analyzed',
      storyboard: parsed.message,
      rawResponse: parsed,
    },
  })

  return {
    aiJudgeScoreId: updated.id,
    submissionId: submission.id,
    videoS3Uri,
    storyboard: updated.storyboard,
    status: updated.status,
  }
}