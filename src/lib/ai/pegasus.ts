import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'

type RunPegasusParams = {
  videoS3Uri: string
}

type PegasusResponse = {
  message?: unknown
  stopReason?: unknown
  [key: string]: unknown
}

export async function runPegasus({
  videoS3Uri,
}: RunPegasusParams) {
  const region = process.env.AWS_REGION || 'us-east-1'

  const configuredModelId =
    process.env.AWS_BEDROCK_PEGASUS_MODEL_ID

  const bucketOwner = process.env.AWS_ACCOUNT_ID

  if (!configuredModelId) {
    throw new Error(
      'Missing AWS_BEDROCK_PEGASUS_MODEL_ID'
    )
  }

  if (!bucketOwner) {
    throw new Error('Missing AWS_ACCOUNT_ID')
  }

  /*
   * Normalize either:
   *
   * arn:aws:bedrock:us-east-1::foundation-model/twelvelabs.pegasus-1-2-v1:0
   *
   * or:
   *
   * twelvelabs.pegasus-1-2-v1:0
   *
   * into the short Bedrock model ID.
   */
  const modelId = configuredModelId.includes(
    'foundation-model/'
  )
    ? configuredModelId.split('foundation-model/')[1]
    : configuredModelId

  const client = new BedrockRuntimeClient({
    region,
  })

  const inputPrompt = `
Analyze the supplied video and produce two outputs:

1. A detailed factual Storyboard
2. A complete Transcript

Your role is evidence extraction only.

Do not score, judge, critique, interpret, diagnose, or evaluate the submission.

Do not attempt to identify the vehicle make, model, trim, or competitive vehicle unless the speaker explicitly states it.

Do not infer vehicle identity from appearance.

STORYBOARD

Describe the video chronologically from beginning to end.

Include:

- Major scenes and transitions
- Camera perspective and framing
- People shown
- Objects, vehicle areas, controls, displays, screens, cargo areas, seating areas, or features shown
- Physical demonstrations or actions performed
- Clearly visible text, labels, graphics, or numerical values
- Any visual evidence that directly supports something being discussed

Describe only what is clearly and directly visible.

Do not infer the purpose, condition, specification, function, or identity of something unless it is explicitly stated or clearly demonstrated.

If text, numbers, labels, or display values are not clearly legible, say that they are shown but cannot be confirmed.

If a spoken statement and a visual observation appear to conflict, report them separately without deciding which is correct.

TRANSCRIPT

Produce a complete and accurate transcription of all spoken dialogue.

Preserve the speaker's wording as closely as possible.

Do not summarize.
Do not paraphrase.
Do not rewrite.
Do not correct grammar.
Do not add missing information.

Pay close attention to:

- Names
- Vehicle names
- Feature names
- Technical terminology
- Competitive vehicle names
- Numerical values
- Units
- Product names
- Technology names

If a word or phrase cannot be understood confidently, use:

"[inaudible]"

rather than guessing.

If a number can be heard but the unit cannot be determined confidently, preserve the number and mark the uncertain portion as "[inaudible]".

Maintain a strict distinction between:

- What is verbally stated
- What is visually shown
- What is displayed as text or a numerical value
- What action is physically demonstrated

Accuracy is more important than completeness.

Do not invent missing details.

FINAL OUTPUT FORMAT

Produce exactly two clearly labeled sections:

Storyboard:

[chronological factual description]

Transcript:

[complete spoken transcript]

Do not include scoring, analysis, strengths, weaknesses, coaching, recommendations, or rubric commentary.
`.trim()

  const body = {
    inputPrompt,
    mediaSource: {
      s3Location: {
        uri: videoS3Uri,
        bucketOwner,
      },
    },
    temperature: 0.2,
    maxOutputTokens: 4096,
  }

  console.log('Pegasus region:', region)

  console.log(
    'Configured Pegasus model ID:',
    configuredModelId
  )

  console.log(
    'Effective Pegasus model ID:',
    modelId
  )

  console.log(
    'Pegasus video URI:',
    videoS3Uri
  )

  console.log(
    'Pegasus media mode: s3Location'
  )

  console.log('PEGASUS REQUEST BODY:')
  console.log(
    JSON.stringify(body, null, 2)
  )

  const response = await client.send(
    new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body),
    })
  )

  const responseText = Buffer.from(
    response.body
  ).toString('utf8')

  console.log('RAW PEGASUS RESPONSE:')
  console.log(responseText)

  const parsed = JSON.parse(
    responseText
  ) as PegasusResponse

  if (typeof parsed.message !== 'string') {
    throw new Error(
      `Pegasus response did not contain a message: ${responseText}`
    )
  }

  const storyboard = parsed.message.trim()

  /*
   * Pegasus sometimes returns a normal HTTP/model response
   * even though it was unable to access the supplied video.
   *
   * Do not allow that refusal message to continue into Claude
   * and become a completed zero-score judgment.
   */
  const normalizedStoryboard =
    storyboard.toLowerCase()

  const unavailablePatterns = [
    'video is not available',
    'please provide the video',
    'provide the video or a link',
    'cannot provide a detailed storyboard',
    'unable to access the video',
    'could not access the video',
  ]

  if (
    unavailablePatterns.some((pattern) =>
      normalizedStoryboard.includes(pattern)
    )
  ) {
    throw new Error(
      'Pegasus could not access or analyze the supplied video.'
    )
  }

  return {
    storyboard,
    rawResponse: parsed,
    modelId,
  }
}