import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'

type RunPegasusParams = {
  videoS3Uri: string
}

export async function runPegasus({ videoS3Uri }: RunPegasusParams) {
  const region = process.env.AWS_REGION || 'us-east-1'
  const configuredModelId = process.env.AWS_BEDROCK_PEGASUS_MODEL_ID
  const bucketOwner = process.env.AWS_ACCOUNT_ID

  if (!configuredModelId) {
    throw new Error('Missing AWS_BEDROCK_PEGASUS_MODEL_ID')
  }

  if (!bucketOwner) {
    throw new Error('Missing AWS_ACCOUNT_ID')
  }

  /*
   * Normalize either of these:
   *
   * arn:aws:bedrock:us-east-1::foundation-model/twelvelabs.pegasus-1-2-v1:0
   *
   * twelvelabs.pegasus-1-2-v1:0
   *
   * into the short Bedrock model ID.
   */
  const modelId = configuredModelId.includes('foundation-model/')
    ? configuredModelId.split('foundation-model/')[1]
    : configuredModelId

  const client = new BedrockRuntimeClient({ region })

  const body = {
    inputPrompt:
      'Analyze the supplied vehicle inspection video and produce two outputs: a detailed Storyboard and a complete Transcript. For the Storyboard, describe the video chronologically from beginning to end, including the sequence of scenes, camera perspective, major transitions, people shown, vehicle components inspected, inspection tools used, measurements displayed, visual evidence presented, demonstrations performed, and any recommendations or conclusions that are visually supported. Describe only what is visible on screen without interpreting or evaluating the content. Include enough detail that someone who has never seen the video could understand exactly what occurs throughout the inspection. For the Transcript, produce a complete and accurate transcription of all spoken dialogue. Preserve the technician\'s wording as closely as possible, including measurements, service recommendations, maintenance intervals, technical terminology, and guest-facing explanations. Do not summarize, paraphrase, or omit information. If any words are unintelligible, indicate them as "[inaudible]" rather than guessing. When generating both outputs, identify the vehicle make or model if visible or stated, technician introductions and guest context, inspection areas, inspection tools or test results shown, measurements such as tread depth, brake pad thickness, battery test results, fluid conditions, or other numerical values, service recommendations and any supporting visual evidence, maintenance services being performed or recommended, and the closing summary or final recommendations. Do not score, judge, critique, or interpret the submission. Your task is only to generate an accurate factual Storyboard and Transcript that will be used as input for a separate AI evaluation system.',
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
  console.log('Configured Pegasus model ID:', configuredModelId)
  console.log('Effective Pegasus model ID:', modelId)
  console.log('Pegasus video URI:', videoS3Uri)
  console.log('Pegasus bucket owner:', bucketOwner)
  console.log('Pegasus media mode: s3Location')

  const response = await client.send(
    new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body),
    })
  )

  const responseText = Buffer.from(response.body).toString('utf8')

  console.log('RAW PEGASUS RESPONSE:')
  console.log(responseText)

  const parsed = JSON.parse(responseText)

  if (typeof parsed.message !== 'string') {
    throw new Error(
      `Pegasus response did not contain a message: ${responseText}`
    )
  }

  return {
    storyboard: parsed.message,
    rawResponse: parsed,
    modelId,
  }
}