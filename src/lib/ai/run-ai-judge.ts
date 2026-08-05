import {
  Prisma,
  PrismaClient,
} from '@prisma/client'

import {
  runClaudeJudge,
} from './claude'

import {
  runPegasus,
} from './pegasus'

const prisma =
  new PrismaClient()

type RunAiJudgeParams = {
  submissionId: string
}

/**
 * Prisma Json fields require Prisma.InputJsonValue.
 *
 * Bedrock response objects may contain TypeScript types such as
 * unknown even though the actual runtime value is JSON-safe.
 *
 * Serializing and parsing removes undefined/non-JSON typing and
 * gives Prisma a clean JSON-compatible value.
 */
function toPrismaJson(
  value: unknown
): Prisma.InputJsonValue {
  return JSON.parse(
    JSON.stringify(value)
  ) as Prisma.InputJsonValue
}

export async function runAiJudge({
  submissionId,
}: RunAiJudgeParams) {
  const outputBucket =
    process.env
      .AWS_VIDEO_OUTPUT_BUCKET

  if (!outputBucket) {
    throw new Error(
      'Missing AWS_VIDEO_OUTPUT_BUCKET'
    )
  }

  const submission =
    await prisma
      .videoSubmission
      .findUnique({
        where: {
          id: submissionId,
        },

        include: {
          user: true,
        },
      })

  if (!submission) {
    throw new Error(
      `Submission not found: ${submissionId}`
    )
  }

  if (
    !submission
      .processedS3Key
  ) {
    throw new Error(
      `Submission ${submissionId} is missing processedS3Key`
    )
  }

  const aiScore =
    await prisma
      .aiJudgeScore
      .create({
        data: {
          videoSubmissionId:
            submission.id,

          status:
            'analyzing_video',
        },
      })

  const videoS3Uri =
    `s3://${outputBucket}/${submission.processedS3Key}`

  try {
    /*
     * STEP 1:
     * Analyze video with Pegasus.
     */
    const pegasusResult =
      await runPegasus({
        videoS3Uri,
      })

    /*
     * Store the visual storyboard and spoken transcript
     * separately.
     */
    await prisma
      .aiJudgeScore
      .update({
        where: {
          id: aiScore.id,
        },

        data: {
          status:
            'video_analyzed',

          storyboard:
            pegasusResult
              .storyboard,

          transcript:
            pegasusResult
              .transcript ||
            null,

          rawResponse:
            toPrismaJson({
              pegasus:
                pegasusResult
                  .rawResponse,

              pegasusModel:
                pegasusResult
                  .modelId,

              pegasusFullOutput:
                pegasusResult
                  .fullOutput,
            }),
        },
      })

    /*
     * STEP 2:
     * Give Claude both sources of evidence.
     *
     * Keeping explicit headings helps Claude distinguish
     * visual evidence from spoken evidence.
     */
    const claudeInput = `
STORYBOARD

${pegasusResult.storyboard}

TRANSCRIPT

${
  pegasusResult.transcript.trim()
    ? pegasusResult.transcript
    : '[No reliable transcript was produced by the video-analysis system.]'
}
`.trim()

    /*
     * STEP 3:
     * Run the Cadillac judging rubric through Claude.
     */
    const claudeResult =
      await runClaudeJudge({
        pegasusOutput:
          claudeInput,
      })

    const result =
      claudeResult.result

    /*
     * STEP 4:
     * Persist final AI judging result.
     */
    const updated =
      await prisma
        .aiJudgeScore
        .update({
          where: {
            id:
              aiScore.id,
          },

          data: {
            status:
              'completed',

            criterion1Score:
              result
                .criterion1Score,

            criterion2Score:
              result
                .criterion2Score,

            criterion3Score:
              result
                .criterion3Score,

            criterion4Score:
              result
                .criterion4Score,

            criterion5Score:
              result
                .criterion5Score,

            criterion6Score:
              result
                .criterion6Score,

            totalScore:
              result
                .totalScore,

            overallComment:
              result
                .overallComment,

            improvementNotes:
              result
                .improvementNotes,

            rawResponse:
              toPrismaJson({
                pegasus:
                  pegasusResult
                    .rawResponse,

                pegasusModel:
                  pegasusResult
                    .modelId,

                pegasusFullOutput:
                  pegasusResult
                    .fullOutput,

                claude:
                  claudeResult
                    .rawResponse,

                claudeModel:
                  claudeResult
                    .modelId,

                claudeParsed:
                  result,
              }),
          },
        })

    return {
      aiJudgeScoreId:
        updated.id,

      submissionId:
        submission.id,

      videoS3Uri,

      storyboard:
        updated.storyboard,

      transcript:
        updated.transcript,

      totalScore:
        updated
          .totalScore
          ?.toString(),

      status:
        updated.status,
    }
  } catch (error) {
    await prisma
      .aiJudgeScore
      .update({
        where: {
          id:
            aiScore.id,
        },

        data: {
          status:
            'failed',

          errorMessage:
            error instanceof Error
              ? error.message
              : String(error),
        },
      })

    throw error
  }
}