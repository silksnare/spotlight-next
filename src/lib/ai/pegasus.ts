import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'

type RunPegasusParams = {
  videoS3Uri: string
}

type PegasusResponse = {
  message?: string
  stopReason?: string
}

export async function runPegasus({
  videoS3Uri,
}: RunPegasusParams) {
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

  const client = new BedrockRuntimeClient({
    region,
  })

  const body = {
    inputPrompt:
      'Analyze the supplied vehicle inspection video and produce two outputs: a detailed Storyboard and a complete Transcript. For the Storyboard, describe the video chronologically from beginning to end, including the sequence of scenes, camera perspective, major transitions, people shown, vehicle components inspected, inspection tools used, measurements displayed, visual evidence presented, demonstrations performed, and any recommendations or conclusions that are visually supported. Describe only what is visible on screen without interpreting or evaluating the content. Include enough detail that someone who has never seen the video could understand exactly what occurs throughout the inspection. When describing visual evidence, report only what is clearly and directly visible. Do not infer mechanical condition from appearance alone. Do not describe a component as worn, thin, damaged, leaking, corroded, contaminated, defective, unsafe, or otherwise in poor condition unless that condition is clearly visible and unambiguous or is explicitly stated by the technician. Do not infer measurements from appearance. If a measurement is spoken or displayed, report the stated or displayed measurement exactly. If both a spoken measurement and a displayed measurement are available, report both without attempting to reconcile them if they differ. If visual appearance seems to conflict with a spoken or displayed measurement, do not resolve the conflict yourself and do not characterize the component based on appearance. State the observations neutrally. For example, if the technician states that a brake pad measures 8 mm and the brake pad is shown on camera, report that the technician states the brake pad measures 8 mm and that the brake pad is shown on camera. Do not infer that the brake pad appears thin or has minimal material remaining unless that condition is explicitly stated or is objectively and unambiguously demonstrated. Do not invent inspection findings, defects, conditions, measurements, recommendations, or conclusions that are not explicitly visible, displayed, or stated. When there is uncertainty about what is visible, describe only the observable object or action rather than inferring its condition. For the Transcript, produce a complete and accurate transcription of all spoken dialogue. Preserve the technician\'s wording as closely as possible, including measurements, service recommendations, maintenance intervals, technical terminology, and guest-facing explanations. Do not summarize, paraphrase, or omit information. If any words are unintelligible, indicate them as "[inaudible]" rather than guessing. When a spoken word or phrase is uncertain, do not substitute a plausible-sounding word based solely on context. Prefer "[inaudible]" or indicate uncertainty rather than inventing wording. Pay particular attention to automotive terminology, measurement units, vehicle component names, dealership or brand names, and numerical values. When generating both outputs, identify the vehicle make or model if clearly visible or stated, technician introductions and guest context, inspection areas, inspection tools or test results shown, measurements such as tread depth, brake pad thickness, battery test results, fluid conditions, or other numerical values, service recommendations and any supporting visual evidence, maintenance services being performed or recommended, and the closing summary or final recommendations. Maintain a strict distinction between what is visually observed, what is displayed as a measurement or result, and what is verbally stated by the technician. Do not score, judge, critique, interpret, diagnose, or independently evaluate the submission. Your task is only to generate an accurate, factual, evidence-based Storyboard and Transcript that will be used as input for a separate AI evaluation system.',
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
  console.log('Pegasus media mode: s3Location')

  console.log('PEGASUS REQUEST BODY:')
  console.log(JSON.stringify(body, null, 2))

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

  let parsed: PegasusResponse

  try {
    parsed = JSON.parse(responseText) as PegasusResponse
  } catch {
    throw new Error(
      `Pegasus returned invalid JSON: ${responseText.slice(0, 500)}`
    )
  }

  if (typeof parsed.message !== 'string') {
    throw new Error(
      `Pegasus response did not contain a valid message: ${responseText.slice(
        0,
        500
      )}`
    )
  }

  return {
    storyboard: parsed.message,
    rawResponse: parsed,
    modelId,
  }
}