import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'

type RunClaudeJudgeParams = {
  pegasusOutput: string
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

Return ONLY valid JSON.

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

  if (!text) {
    throw new Error('Claude returned no response.')
  }

  return {
    result: JSON.parse(text),
    rawResponse: parsed,
    modelId,
  }
}