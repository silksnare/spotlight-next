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
      'Analyze the supplied vehicle inspection video and produce two outputs: a detailed Storyboard and a complete Transcript. For the Storyboard, describe the video chronologically from beginning to end, including the sequence of scenes, camera perspective, major transitions, people shown, vehicle components inspected, inspection tools used, measurements displayed, visual evidence presented, demonstrations performed, and any recommendations or conclusions that are visually supported. Describe only what is clearly visible on screen without interpreting, evaluating, diagnosing, or judging the content. Include enough detail that someone who has never seen the video could understand exactly what occurs throughout the inspection. When describing visual evidence, report only what is clearly and directly visible. Do not infer mechanical condition from appearance alone. Do not describe a component as worn, thin, damaged, leaking, corroded, contaminated, defective, unsafe, or otherwise in poor condition unless that condition is clearly visible and unambiguous or is explicitly stated by the technician. Do not infer measurements from appearance. If a measurement is spoken, report the spoken value exactly in the Transcript. If a measurement is visually displayed on a gauge, measuring tool, screen, label, odometer, dashboard, test result, or other visual display, report the exact value only when the value and its unit are clearly legible and unambiguous. If the visual value or unit cannot be read with high confidence, state that a measurement or result is shown but that the exact value cannot be confirmed visually. Do not guess, approximate, reconstruct, or infer partially visible numerical values. Do not convert units or reinterpret a displayed value. If both a spoken measurement and a clearly legible displayed measurement are available, report them separately and preserve each value exactly as presented. Do not attempt to reconcile them if they differ. Explicitly distinguish the spoken value from the visually displayed value. If visual appearance seems to conflict with a spoken or displayed measurement, do not resolve the conflict yourself and do not characterize the component based on appearance. State the observations neutrally. For example, if the technician states that a brake pad measures 8 mm and the brake pad is shown on camera, report that the technician states the brake pad measures 8 mm and that the brake pad is shown on camera. Do not infer that the brake pad appears thin or has minimal material remaining unless that condition is explicitly stated or is objectively and unambiguously demonstrated. Do not infer mileage, dashboard status, warning-light status, measurement values, test results, component condition, or other detailed information from a brief, distant, blurred, partially obscured, or otherwise unclear visual. If dashboard indicators or warning lights are shown but their exact status cannot be confidently determined, state only that the dashboard or indicators are shown. Do not infer the function of an inspection tool or mechanical action unless its purpose is explicitly stated by the technician or clearly and unambiguously demonstrated. Describe the observable action rather than assuming its purpose. For example, if a technician places a tool against or near a brake component, describe the tool and the action that is visible. Do not state that the tool is removing, measuring, adjusting, repairing, or testing the component unless that function is clearly established. Do not invent inspection findings, defects, conditions, measurements, recommendations, actions, tool functions, or conclusions that are not explicitly visible, clearly displayed, or stated. When there is uncertainty about what is visible, describe only the observable object or action rather than inferring its condition, purpose, measurement, or meaning. When visual evidence supports something the technician verbally states, describe the visual evidence separately from the technician\'s statement so that the two sources of information remain distinguishable. For the Transcript, produce a complete and accurate transcription of all spoken dialogue. Preserve the technician\'s wording as closely as possible, including measurements, service recommendations, maintenance intervals, technical terminology, vehicle component names, dealership or brand names, and guest-facing explanations. Do not summarize, paraphrase, rewrite, correct, or omit spoken information. If any words are unintelligible, indicate them as "[inaudible]" rather than guessing. When a spoken word or phrase is uncertain, do not substitute a plausible-sounding word based solely on context. Prefer "[inaudible]" rather than inventing wording. Pay particular attention to automotive terminology, measurement units, vehicle component names, dealership or brand names, and numerical values. For numerical measurements, preserve exactly what can be heard. Do not convert, normalize, or reinterpret a spoken measurement. If the numerical value can be heard but the unit cannot be determined confidently, transcribe the numerical value and mark the uncertain portion as "[inaudible]" rather than guessing the unit. If a phrase sounds inconsistent with the surrounding automotive context but the audio is not clear enough to determine the actual wording, use "[inaudible]" rather than producing a contextually unlikely transcription. Do not automatically replace uncertain speech with a word or phrase that merely sounds phonetically similar. When generating both outputs, identify the vehicle make or model only if clearly visible or explicitly stated, technician introductions and guest context, inspection areas, inspection tools or test results shown, measurements such as tread depth, brake pad thickness, battery test results, fluid conditions, or other numerical values, service recommendations and any supporting visual evidence, maintenance services being performed or recommended, and the closing summary or final recommendations. Maintain a strict distinction between three categories of evidence: what is visually observed, what is clearly displayed as a measurement or result, and what is verbally stated by the technician. Never combine these categories in a way that makes an inferred fact appear directly observed. When information is uncertain, explicitly preserve that uncertainty rather than resolving it yourself. Accuracy and evidence fidelity are more important than producing a complete-sounding description. It is acceptable to state that something cannot be confidently determined from the video. Do not score, judge, critique, interpret, diagnose, independently evaluate, or determine the correctness of the submission. Your task is only to generate an accurate, factual, conservative, evidence-based Storyboard and Transcript that will be used as input for a separate AI evaluation system.',
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