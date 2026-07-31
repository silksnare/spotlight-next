// import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

// type RunPegasusParams = {
//   videoS3Uri: string
// }

// export async function runPegasus({ videoS3Uri }: RunPegasusParams) {
//   const region = process.env.AWS_REGION || 'us-east-1'
//   const modelId = process.env.AWS_BEDROCK_PEGASUS_MODEL_ID
//   const bucketOwner = process.env.AWS_ACCOUNT_ID

//   if (!modelId) throw new Error('Missing AWS_BEDROCK_PEGASUS_MODEL_ID')
//   if (!bucketOwner) throw new Error('Missing AWS_ACCOUNT_ID')

//   const client = new BedrockRuntimeClient({ region })

//   const body = {
//     inputPrompt:
//       'Analyze the supplied vehicle inspection video and produce two outputs: a detailed Storyboard and a complete Transcript. For the Storyboard, describe the video chronologically from beginning to end, including the sequence of scenes, camera perspective, major transitions, people shown, vehicle components inspected, inspection tools used, measurements displayed, visual evidence presented, demonstrations performed, and any recommendations or conclusions that are visually supported. Describe only what is visible on screen without interpreting or evaluating the content. Include enough detail that someone who has never seen the video could understand exactly what occurs throughout the inspection. For the Transcript, produce a complete and accurate transcription of all spoken dialogue. Preserve the technician\'s wording as closely as possible, including measurements, service recommendations, maintenance intervals, technical terminology, and guest-facing explanations. Do not summarize, paraphrase, or omit information. If any words are unintelligible, indicate them as "[inaudible]" rather than guessing. When generating both outputs, identify the vehicle make or model if visible or stated, technician introductions and guest context, inspection areas, inspection tools or test results shown, measurements such as tread depth, brake pad thickness, battery test results, fluid conditions, or other numerical values, service recommendations and any supporting visual evidence, maintenance services being performed or recommended, and the closing summary or final recommendations. Do not score, judge, critique, or interpret the submission. Your task is only to generate an accurate factual Storyboard and Transcript that will be used as input for a separate AI evaluation system.',
//     mediaSource: {
//       s3Location: {
//         uri: videoS3Uri,
//         bucketOwner,
//       },
//     },
//     temperature: 0.2,
//     maxOutputTokens: 4096,
//   }

//   const response = await client.send(
//     new InvokeModelCommand({
//       modelId,
//       contentType: 'application/json',
//       accept: 'application/json',
//       body: JSON.stringify(body),
//     })
//   )

//   const responseText = Buffer.from(response.body).toString('utf8')

//   console.log('RAW PEGASUS RESPONSE:')
//   console.log(responseText)

//   const parsed = JSON.parse(responseText)

//   console.log('PARSED PEGASUS RESPONSE:')
//   console.log(JSON.stringify(parsed, null, 2))

//   return {
//     storyboard: parsed.message as string,
//     rawResponse: parsed,
//     modelId,
//   }
// }

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'

type RunPegasusParams = {
  videoS3Uri: string
}

function parseS3Uri(uri: string) {
  const match = uri.match(/^s3:\/\/([^/]+)\/(.+)$/)

  if (!match) {
    throw new Error(`Invalid S3 URI: ${uri}`)
  }

  return {
    bucket: match[1],
    key: match[2],
  }
}

async function streamToBuffer(
  stream: AsyncIterable<Uint8Array>
): Promise<Buffer> {
  const chunks: Buffer[] = []

  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk))
  }

  return Buffer.concat(chunks)
}

export async function runPegasus({ videoS3Uri }: RunPegasusParams) {
  const region = process.env.AWS_REGION || 'us-east-1'
  const configuredModelId = process.env.AWS_BEDROCK_PEGASUS_MODEL_ID

  if (!configuredModelId) {
    throw new Error('Missing AWS_BEDROCK_PEGASUS_MODEL_ID')
  }

  const { bucket, key } = parseS3Uri(videoS3Uri)

  const s3 = new S3Client({ region })

  console.log('Downloading video for Base64 Pegasus test...')
  console.log('Bucket:', bucket)
  console.log('Key:', key)

  const object = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  )

  if (!object.Body) {
    throw new Error('S3 returned an empty object body')
  }

  const videoBuffer = await streamToBuffer(
    object.Body as AsyncIterable<Uint8Array>
  )

  console.log('Downloaded video bytes:', videoBuffer.length)

  const base64Video = videoBuffer.toString('base64')

  // Use the documented short model ID for this diagnostic test.
  const modelId = 'twelvelabs.pegasus-1-2-v1:0'

  const client = new BedrockRuntimeClient({ region })

  const body = {
    inputPrompt:
      'Describe this video in chronological detail and provide a complete transcript of all spoken dialogue.',
    mediaSource: {
      base64String: base64Video,
    },
    temperature: 0.2,
    maxOutputTokens: 4096,
  }

  console.log('Pegasus region:', region)
  console.log('Pegasus model ID:', modelId)
  console.log('Media mode: base64String')
  console.log('Base64 length:', base64Video.length)

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

  return {
    storyboard: parsed.message as string,
    rawResponse: parsed,
    modelId,
  }
}