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
  criterion2Explanation: string
  criterion3Explanation: string
  criterion4Explanation: string
  criterion5Explanation: string
  criterion6Explanation: string

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

export async function runClaudeJudge({
  pegasusOutput,
}: RunClaudeJudgeParams) {
  const region = process.env.AWS_REGION || 'us-east-1'
  const modelId = process.env.AWS_BEDROCK_CLAUDE_MODEL_ID

  if (!modelId) {
    throw new Error('Missing AWS_BEDROCK_CLAUDE_MODEL_ID')
  }

  const client = new BedrockRuntimeClient({ region })

  const prompt = `
You are serving as an official contest judge evaluating a submitted vehicle inspection video.

Review the submission using only the information provided in the video storyboard and video transcript.

Evaluate the submission from the perspective of a Subject Matter Expert.

Do not assume the existence of information, actions, measurements, visual evidence, tools, explanations, or recommendations that are not explicitly present in the submission.

If the submission description states that a visual element is shown, you may consider it present.

If a recommendation is made without supporting evidence being shown or described, reflect that appropriately in the score.

Return only the raw JSON object.

Do not include Markdown.
Do not include JSON code fences.
Do not include commentary before or after the JSON.
The first character of your response must be {
The final character of your response must be }

When assigning scores:

• Score each criterion between 0.00 and 3.00
• Use increments of 0.25 only
• Every score must be supported by evidence from the submission
• Avoid score inflation
• Judge consistently as though this were a competitive contest

For each criterion provide:

• Score
• Detailed explanation
• Supporting evidence
• Strengths
• Opportunities for improvement

Criteria:

1. Introduction & Guest Context
2. Explanation of Inspection Findings
3. Service Recommendation & Urgency
4. Communication Clarity & Professionalism
5. Organization & Video Flow
6. Accuracy of Recommendations

After evaluating all criteria:

• Calculate the total score out of 18.00.
• Provide an Overall Judge Comment.
• Provide Opportunities for Improvement.

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
  "criterion2Explanation": "",
  "criterion3Explanation": "",
  "criterion4Explanation": "",
  "criterion5Explanation": "",
  "criterion6Explanation": "",
  "overallComment": "",
  "improvementNotes": ""
}

Vehicle inspection submission:

${pegasusOutput}
`.trim()

  const body = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 4096,
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
  const parsed = JSON.parse(responseText)

  const text = parsed.content?.[0]?.text

  if (!text || typeof text !== 'string') {
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

  return {
    result,
    rawResponse: parsed,
    modelId,
  }
}