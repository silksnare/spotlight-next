import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'

type RunClaudeJudgeParams = {
  pegasusOutput: string
}

type ClaudeJudgeResult = {
  criterion1Score: number
  criterion2Score: number
  criterion3Score: number
  criterion4Score: number
  criterion5Score: number
  criterion6Score: number
  totalScore: number

  criterion1Explanation: string
  criterion1Evidence: string
  criterion1Strengths: string
  criterion1Improvements: string

  criterion2Explanation: string
  criterion2Evidence: string
  criterion2Strengths: string
  criterion2Improvements: string

  criterion3Explanation: string
  criterion3Evidence: string
  criterion3Strengths: string
  criterion3Improvements: string

  criterion4Explanation: string
  criterion4Evidence: string
  criterion4Strengths: string
  criterion4Improvements: string

  criterion5Explanation: string
  criterion5Evidence: string
  criterion5Strengths: string
  criterion5Improvements: string

  criterion6Explanation: string
  criterion6Evidence: string
  criterion6Strengths: string
  criterion6Improvements: string

  overallComment: string
  improvementNotes: string
}

function extractJson(text: string): string {
  const trimmed = text.trim()

  const fencedMatch = trimmed.match(
    /^```(?:json)?\s*([\s\S]*?)\s*```$/i
  )

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim()
  }

  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1)
  }

  return trimmed
}

function validateScore(
  score: number,
  fieldName: keyof ClaudeJudgeResult
) {
  if (!Number.isFinite(score)) {
    throw new Error(`${String(fieldName)} must be a valid number.`)
  }

  if (score < 0 || score > 3) {
    throw new Error(
      `${String(fieldName)} must be between 0.00 and 3.00.`
    )
  }

  const quarterSteps = score * 4

  if (!Number.isInteger(quarterSteps)) {
    throw new Error(
      `${String(fieldName)} must use increments of 0.25.`
    )
  }
}

function validateTextField(
  value: unknown,
  fieldName: keyof ClaudeJudgeResult
) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${String(fieldName)} must be a non-empty string.`)
  }
}

function validateJudgeResult(result: ClaudeJudgeResult) {
  const scoreFields: Array<keyof ClaudeJudgeResult> = [
    'criterion1Score',
    'criterion2Score',
    'criterion3Score',
    'criterion4Score',
    'criterion5Score',
    'criterion6Score',
  ]

  for (const fieldName of scoreFields) {
    validateScore(
      result[fieldName] as number,
      fieldName
    )
  }

  const calculatedTotal =
    result.criterion1Score +
    result.criterion2Score +
    result.criterion3Score +
    result.criterion4Score +
    result.criterion5Score +
    result.criterion6Score

  if (!Number.isFinite(result.totalScore)) {
    throw new Error('totalScore must be a valid number.')
  }

  if (
    Math.abs(result.totalScore - calculatedTotal) >
    0.001
  ) {
    throw new Error(
      `Claude totalScore does not match the criterion total. ` +
        `Expected ${calculatedTotal.toFixed(2)}, ` +
        `received ${result.totalScore}.`
    )
  }

  const textFields: Array<keyof ClaudeJudgeResult> = [
    'criterion1Explanation',
    'criterion1Evidence',
    'criterion1Strengths',
    'criterion1Improvements',

    'criterion2Explanation',
    'criterion2Evidence',
    'criterion2Strengths',
    'criterion2Improvements',

    'criterion3Explanation',
    'criterion3Evidence',
    'criterion3Strengths',
    'criterion3Improvements',

    'criterion4Explanation',
    'criterion4Evidence',
    'criterion4Strengths',
    'criterion4Improvements',

    'criterion5Explanation',
    'criterion5Evidence',
    'criterion5Strengths',
    'criterion5Improvements',

    'criterion6Explanation',
    'criterion6Evidence',
    'criterion6Strengths',
    'criterion6Improvements',

    'overallComment',
    'improvementNotes',
  ]

  for (const fieldName of textFields) {
    validateTextField(result[fieldName], fieldName)
  }
}

export async function runClaudeJudge({
  pegasusOutput,
}: RunClaudeJudgeParams) {
  const region = process.env.AWS_REGION || 'us-east-1'
  const modelId = process.env.AWS_BEDROCK_CLAUDE_MODEL_ID

  if (!modelId) {
    throw new Error('Missing AWS_BEDROCK_CLAUDE_MODEL_ID')
  }

  if (!pegasusOutput.trim()) {
    throw new Error('Pegasus output is empty.')
  }

  const client = new BedrockRuntimeClient({ region })

  const prompt = `
You are serving as an official contest judge evaluating a submitted vehicle inspection video.

Review the submission using only the information provided in the video storyboard and video transcript.

Evaluate the submission from the perspective of a Subject Matter Expert.

Do not assume the existence of information, actions, measurements, visual evidence, tools, explanations, or recommendations that are not explicitly present in the submission.

If the submission description states that a visual element is shown, you may consider it present.

If a recommendation is made without supporting evidence being shown or described, reflect that appropriately in the score.

Maintain a professional, objective contest-judging tone.

Return only the raw JSON object.

Do not include Markdown.
Do not include JSON code fences.
Do not include commentary before or after the JSON.
The first character of your response must be {
The final character of your response must be }

Scoring requirements:

- Score each criterion between 0.00 and 3.00.
- Use increments of 0.25 only.
- Every score must be supported by specific evidence from the submission.
- Avoid score inflation.
- Judge consistently as though this were a competitive contest entry.
- Explain both what the submission did well and what prevented it from receiving a higher score.
- Do not award a perfect score unless the submission fully satisfies the criterion with no meaningful weakness.
- The total score must exactly equal the sum of all six criterion scores.

For each criterion, return all of the following:

1. Numeric score.
2. Detailed explanation of why the score was assigned.
3. Specific supporting evidence from the storyboard or transcript.
4. Strengths demonstrated within that criterion.
5. Practical opportunities for improvement that would increase the score.

Keep each field distinct:

- Explanation explains why the score was assigned.
- Evidence identifies concrete facts, dialogue, measurements, visuals, or actions from the submission.
- Strengths summarizes what was done effectively.
- Improvements gives specific actions that would raise the score.

Do not repeat identical sentences across these fields.

Criteria:

1. Introduction & Guest Context
2. Explanation of Inspection Findings
3. Service Recommendation & Urgency
4. Communication Clarity & Professionalism
5. Organization & Video Flow
6. Accuracy of Recommendations

Criterion guidance:

Criterion 1 – Introduction & Guest Context
Evaluate whether the technician identifies themselves, establishes the vehicle or guest context, explains the purpose of the video, and helps the guest understand why the inspection matters.

Criterion 2 – Explanation of Inspection Findings
Evaluate the clarity, completeness, and guest usefulness of the inspection findings. Consider whether measurements, test results, tools, vehicle components, and visible evidence are explained in understandable language.

Criterion 3 – Service Recommendation & Urgency
Evaluate whether recommendations are clearly stated, justified, prioritized, and categorized appropriately as immediate, preventative, future, required, or optional. Consider whether the guest would understand what action is needed and why.

Criterion 4 – Communication Clarity & Professionalism
Evaluate tone, confidence, clarity, pacing, organization of speech, guest focus, professionalism, and the technician's ability to simplify technical information.

Criterion 5 – Organization & Video Flow
Evaluate the logical progression of the video, transitions between inspection areas, sequencing of information, ease of following the inspection, and effectiveness of the opening and closing.

Criterion 6 – Accuracy of Recommendations
Evaluate whether findings and recommendations are supported by the storyboard and transcript. Consider whether measurements, thresholds, visible evidence, inspection results, and service recommendations are logically connected.

After evaluating all criteria:

- Calculate the total score out of 18.00.
- Provide a detailed Overall Judge Comment written from the perspective of an experienced contest judge.
- The Overall Judge Comment should summarize the effectiveness of the submission, the guest experience it creates, how well it demonstrates the value of the inspection process, and how effectively it builds trust and understanding for the guest.
- Provide a separate Opportunities for Improvement section in improvementNotes.
- improvementNotes should focus on practical, specific changes the technician could make to increase competitiveness in future judging rounds.
- Do not simply repeat the six criterion improvement fields. Synthesize the most important improvements into a cohesive overall development plan.

Return ONLY valid JSON matching this exact structure:

{
  "criterion1Score": 0,
  "criterion2Score": 0,
  "criterion3Score": 0,
  "criterion4Score": 0,
  "criterion5Score": 0,
  "criterion6Score": 0,
  "totalScore": 0,

  "criterion1Explanation": "",
  "criterion1Evidence": "",
  "criterion1Strengths": "",
  "criterion1Improvements": "",

  "criterion2Explanation": "",
  "criterion2Evidence": "",
  "criterion2Strengths": "",
  "criterion2Improvements": "",

  "criterion3Explanation": "",
  "criterion3Evidence": "",
  "criterion3Strengths": "",
  "criterion3Improvements": "",

  "criterion4Explanation": "",
  "criterion4Evidence": "",
  "criterion4Strengths": "",
  "criterion4Improvements": "",

  "criterion5Explanation": "",
  "criterion5Evidence": "",
  "criterion5Strengths": "",
  "criterion5Improvements": "",

  "criterion6Explanation": "",
  "criterion6Evidence": "",
  "criterion6Strengths": "",
  "criterion6Improvements": "",

  "overallComment": "",
  "improvementNotes": ""
}

Vehicle inspection submission:

${pegasusOutput}
`.trim()

  const body = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 8192,
    temperature: 0.2,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
  }

  const response = await client.send(
    new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body),
    })
  )

  const responseText = Buffer.from(response.body).toString('utf8')

  let parsed: {
    content?: Array<{
      type?: string
      text?: string
    }>
  }

  try {
    parsed = JSON.parse(responseText)
  } catch {
    throw new Error(
      `Claude returned an invalid Bedrock response: ${responseText.slice(
        0,
        500
      )}`
    )
  }

  const text = parsed.content
    ?.filter((item) => item.type === 'text')
    .map((item) => item.text || '')
    .join('')
    .trim()

  if (!text) {
    throw new Error('Claude returned no response.')
  }

  const cleanedText = extractJson(text)

  let result: ClaudeJudgeResult

  try {
    result = JSON.parse(cleanedText) as ClaudeJudgeResult
  } catch (error) {
    console.error('Claude raw response text:', text)
    console.error('Claude cleaned response text:', cleanedText)

    throw new Error(
      `Claude returned invalid JSON: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }

  validateJudgeResult(result)

  return {
    result,
    rawResponse: parsed,
    modelId,
  }
}