import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ContentBlock,
} from '@aws-sdk/client-bedrock-runtime'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

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

type ClaudeRawResponse = {
  stopReason: string | null
  outputText: string
  usage: {
    inputTokens: number | null
    outputTokens: number | null
    totalTokens: number | null
  }
  metrics: {
    latencyMs: number | null
  }
}

type ReferenceDocument = {
  filename: string
  documentName: string
}

const REFERENCE_DOCUMENTS: ReferenceDocument[] = [
  {
    filename: '26MPI_Rules.pdf',
    documentName: 'Official Rules',
  },
  {
    filename: '26MPI_Judging.pdf',
    documentName: 'Judging Rubric',
  },
  {
    filename: '26MPI_BestPractices.pdf',
    documentName: 'Best Practices',
  },
]

const CRITERION_MAX_SCORES = {
  criterion1Score: 15,
  criterion2Score: 10,
  criterion3Score: 10,
  criterion4Score: 15,
  criterion5Score: 25,
  criterion6Score: 25,
} as const

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
  fieldName: keyof typeof CRITERION_MAX_SCORES
) {
  const maxScore = CRITERION_MAX_SCORES[fieldName]

  if (!Number.isFinite(score)) {
    throw new Error(
      `${String(fieldName)} must be a valid number.`
    )
  }

  if (!Number.isInteger(score)) {
    throw new Error(
      `${String(fieldName)} must be a whole-number score.`
    )
  }

  if (score < 0 || score > maxScore) {
    throw new Error(
      `${String(fieldName)} must be between 0 and ${maxScore}.`
    )
  }
}

function validateTextField(
  value: unknown,
  fieldName: keyof ClaudeJudgeResult
) {
  if (
    typeof value !== 'string' ||
    !value.trim()
  ) {
    throw new Error(
      `${String(fieldName)} must be a non-empty string.`
    )
  }
}

function validateJudgeResult(
  result: ClaudeJudgeResult
) {
  validateScore(
    result.criterion1Score,
    'criterion1Score'
  )

  validateScore(
    result.criterion2Score,
    'criterion2Score'
  )

  validateScore(
    result.criterion3Score,
    'criterion3Score'
  )

  validateScore(
    result.criterion4Score,
    'criterion4Score'
  )

  validateScore(
    result.criterion5Score,
    'criterion5Score'
  )

  validateScore(
    result.criterion6Score,
    'criterion6Score'
  )

  const calculatedTotal =
    result.criterion1Score +
    result.criterion2Score +
    result.criterion3Score +
    result.criterion4Score +
    result.criterion5Score +
    result.criterion6Score

  if (!Number.isFinite(result.totalScore)) {
    throw new Error(
      'totalScore must be a valid number.'
    )
  }

  if (!Number.isInteger(result.totalScore)) {
    throw new Error(
      'totalScore must be a whole-number score.'
    )
  }

  if (
    result.totalScore < 0 ||
    result.totalScore > 100
  ) {
    throw new Error(
      'totalScore must be between 0 and 100.'
    )
  }

  if (
    result.totalScore !== calculatedTotal
  ) {
    throw new Error(
      `Claude totalScore does not match the criterion total. ` +
        `Expected ${calculatedTotal}, ` +
        `received ${result.totalScore}.`
    )
  }

  const textFields: Array<
    keyof ClaudeJudgeResult
  > = [
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
    validateTextField(
      result[fieldName],
      fieldName
    )
  }
}

async function loadReferenceDocuments(): Promise<
  ContentBlock[]
> {
  const documentsDirectory = path.join(
    process.cwd(),
    'public',
    'documents'
  )

  return Promise.all(
    REFERENCE_DOCUMENTS.map(
      async ({
        filename,
        documentName,
      }): Promise<ContentBlock> => {
        const documentPath = path.join(
          documentsDirectory,
          filename
        )

        let bytes: Uint8Array

        try {
          bytes = await readFile(documentPath)
        } catch (error) {
          throw new Error(
            `Unable to read Claude reference document ` +
              `${documentPath}: ${
                error instanceof Error
                  ? error.message
                  : String(error)
              }`
          )
        }

        if (bytes.length === 0) {
          throw new Error(
            `Claude reference document is empty: ${documentPath}`
          )
        }

        return {
          document: {
            format: 'pdf',
            name: documentName,
            source: {
              bytes,
            },
          },
        }
      }
    )
  )
}

function getClaudeOutputText(
  content: ContentBlock[] | undefined
): string {
  if (!content) {
    return ''
  }

  return content
    .map((block) => {
      if (
        'text' in block &&
        typeof block.text === 'string'
      ) {
        return block.text
      }

      return ''
    })
    .join('')
    .trim()
}

export async function runClaudeJudge({
  pegasusOutput,
}: RunClaudeJudgeParams) {
  const region =
    process.env.AWS_REGION || 'us-east-1'

  const modelId =
    process.env.AWS_BEDROCK_CLAUDE_MODEL_ID

  if (!modelId) {
    throw new Error(
      'Missing AWS_BEDROCK_CLAUDE_MODEL_ID'
    )
  }

  if (!pegasusOutput.trim()) {
    throw new Error(
      'Pegasus output is empty.'
    )
  }

  const referenceDocuments =
    await loadReferenceDocuments()

  const client = new BedrockRuntimeClient({
    region,
  })

  const prompt = `
You are serving as an official judge for the Cadillac "Choose Your EV" Conquest Challenge.

You are evaluating one submitted Sales Consultant walkaround video.

The following reference documents are attached:

1. Official Rules
2. Judging Rubric
3. Best Practices

Treat the attached Official Rules and Judging Rubric as the authoritative basis for scoring.

Use the Best Practices document as supporting guidance for understanding the intended quality of a strong presentation, but do not create additional scoring requirements that are not supported by the Official Rules or Judging Rubric.

The supplied Storyboard and Transcript were generated by an automated video-analysis system from the contestant's original video.

Your job is to evaluate the contestant's presentation using the attached contest materials and the reliable evidence contained in the Storyboard and Transcript.

Do not judge the automated video-analysis system itself.

SCORING STRUCTURE

There are six scored criteria totaling 100 points:

1. Customer Profile Incorporated — maximum 15 points
2. Introducing Your Cadillac EV — maximum 10 points
3. High-level Positioning — maximum 10 points
4. Importance to Cadillac — maximum 15 points
5. Reasons for Purchase — maximum 25 points
6. Conquest Selling / Competitive Positioning — maximum 25 points

Score using WHOLE NUMBERS ONLY.

The six scores must total exactly 100 points or less.

Do not convert the scores to percentages.

Do not normalize the criteria to equal weights.

Use the exact maximum values listed above.

SCORING PHILOSOPHY

Judge this as a competitive national contest entry.

Award points based on how completely and effectively the contestant demonstrates the requirements of each criterion.

Do not award points merely because a topic could reasonably have been intended.

Do not assume content occurred in the original video when it is absent from the Storyboard and Transcript.

Do not require every optional recommendation in the Best Practices document in order to receive a strong score.

Do not deduct points solely because a production technique is imperfect unless it materially affects communication or the contest requirements.

Quality of selling communication matters.

A contestant who simply names a feature should generally receive less credit than a contestant who clearly explains the feature's customer benefit.

A contestant who connects that benefit directly to the provided customer profile may deserve stronger credit where relevant.

For competitive positioning, distinguish between:

- merely mentioning the customer's current competitive vehicle,
- making generic statements about Cadillac,
- explaining actual Cadillac advantages,
- and clearly connecting those advantages to reasons the customer should move from the competitive EV to the Cadillac EV.

Do not inflate scores.

Do not artificially lower scores to create separation.

Score the evidence as presented.

IMPORTANT EVIDENCE RELIABILITY RULES

The Storyboard and Transcript were generated by an automated system and may occasionally contain:

- transcription errors,
- phonetic substitutions,
- incorrect punctuation,
- uncertain names,
- uncertain product terminology,
- OCR errors,
- visual-recognition errors,
- or uncertain interpretations of what is shown.

Do not penalize the contestant for an apparent error when the surrounding evidence strongly suggests that the automated evidence-extraction system caused the error.

Do not silently invent a replacement word, vehicle name, specification, feature, or statement.

Instead, treat the questionable portion as uncertain.

Do not use an uncertain extracted detail as the sole basis for a deduction.

Give greatest weight to evidence that is:

- explicit,
- internally consistent,
- clearly spoken,
- clearly demonstrated,
- or supported by multiple portions of the Storyboard and Transcript.

If the Storyboard and Transcript conflict, do not automatically assume either one is correct.

If enough reliable evidence remains to evaluate the criterion, use that reliable evidence.

If required evidence is genuinely absent, score the absence according to the Judging Rubric.

Do not confuse unreliable evidence with absent evidence.

VEHICLE IDENTITY

Do not identify or infer the Cadillac model from visual appearance alone.

Determine the vehicle being presented only from reliable spoken or written evidence contained in the Storyboard or Transcript.

If the contestant explicitly identifies the vehicle, use that identification when applying the model-specific requirements in the attached documents.

If the vehicle identity cannot be determined reliably, do not invent it.

Likewise, do not identify the customer's competitive vehicle from appearance alone.

Use explicit evidence.

CRITERION 1 — CUSTOMER PROFILE INCORPORATED
Maximum: 15 points

Evaluate how well the Sales Consultant incorporates the provided customer profile associated with the presented Cadillac EV.

Look for actual use of customer-specific information such as:

- customer name,
- current competitive EV,
- family situation,
- profession,
- lifestyle,
- interests,
- travel needs,
- technology interests,
- space or utility needs,
- EV ownership interests,
- or other profile details contained in the attached contest materials.

Do not give full credit merely because the consultant says the customer's name.

Strong performance should demonstrate meaningful tailoring of the presentation to the customer's needs and priorities.

Score:
0 through 15 whole points.

CRITERION 2 — INTRODUCING YOUR CADILLAC EV
Maximum: 10 points

Evaluate whether the Sales Consultant properly introduces the selected Cadillac EV according to the model-specific expectations in the attached Judging Rubric and Official Rules.

Use the exact model-specific language and expectations from those attached documents as the reference standard.

Do not invent alternate taglines or substitute generalized Cadillac messaging.

Consider whether the required introduction or positioning statement is:

- explicitly stated,
- substantially communicated,
- partially communicated,
- or absent.

Score:
0 through 10 whole points.

CRITERION 3 — HIGH-LEVEL POSITIONING
Maximum: 10 points

Evaluate how effectively the Sales Consultant communicates the Cadillac EV's high-level position according to the model-specific positioning defined in the attached documents.

Consider whether the contestant explains relevant positioning such as:

- vehicle size or segment,
- two-row or three-row role,
- place within Cadillac's EV portfolio,
- entry, core, or flagship role,
- luxury positioning,
- space positioning,
- or other model-specific positioning defined by the official materials.

Do not award credit for positioning that the contestant never communicates.

Score:
0 through 10 whole points.

CRITERION 4 — IMPORTANCE TO CADILLAC
Maximum: 15 points

Evaluate how effectively the Sales Consultant explains why the selected EV matters to Cadillac.

Use the specific model-level guidance provided in the attached Official Rules and Judging Rubric.

Look for meaningful discussion of the vehicle's role in areas such as:

- Cadillac's EV portfolio,
- attracting new luxury buyers,
- Cadillac's all-electric strategy,
- segment leadership,
- flagship role,
- technology leadership,
- design leadership,
- luxury positioning,
- or other strategic importance defined in the official materials.

Do not substitute your own automotive strategy knowledge for what the contest documents require.

Score:
0 through 15 whole points.

CRITERION 5 — REASONS FOR PURCHASE
Maximum: 25 points

Evaluate how well the Sales Consultant explains persuasive selling points for the selected Cadillac EV.

This criterion should consider both breadth and effectiveness.

Look for relevant selling points such as features, capabilities, technology, comfort, luxury, space, performance, charging, range, utility, design, convenience, driver assistance, or other benefits discussed in the presentation.

Distinguish between:

- simply naming a feature,
- explaining what the feature does,
- explaining the customer's benefit,
- and connecting the benefit directly to the customer's profile or needs.

Strong scores should reflect a persuasive customer-focused reason to purchase the Cadillac EV, not simply a list of specifications.

Use only information supported by the attached reference materials or reliable submission evidence.

Do not introduce outside technical specifications or standards.

Score:
0 through 25 whole points.

CRITERION 6 — CONQUEST SELLING / COMPETITIVE POSITIONING
Maximum: 25 points

Evaluate how effectively the Sales Consultant explains the competitive advantages of the Cadillac EV compared with the customer's designated competitive model.

Use the customer/competitor pairings and contest guidance contained in the attached reference documents.

Look for evidence that the contestant:

- recognizes the customer's current competitive EV,
- makes relevant comparisons,
- explains Cadillac advantages,
- identifies meaningful differentiators,
- translates those differences into customer benefits,
- and gives the customer reasons to move from the competitive EV to Cadillac.

Generic statements that Cadillac is luxurious, better, or more advanced should receive less credit than clear, specific, customer-relevant competitive selling.

Do not verify competitive claims using outside knowledge.

Evaluate only against the attached reference documents and reliable submission evidence.

Score:
0 through 25 whole points.

PROFESSIONALISM AND PRESENTATION QUALITY

The Official Rules also identify qualities such as:

- professionalism,
- vehicle knowledge,
- competitive positioning,
- communication and delivery,
- overall presentation,
- originality,
- and creativity.

These qualities should inform your evaluation of how effectively the contestant delivers the six scored criteria.

They are not separate seventh, eighth, or additional scoring categories.

Do not add points beyond the 100-point rubric.

Do not create separate deductions that cause double-counting.

FOR EACH CRITERION RETURN

For every criterion provide:

1. Score
2. Explanation
3. Supporting evidence
4. Strengths
5. Opportunities for improvement

Keep these fields distinct.

Explanation:
Explain why the score was assigned relative to the rubric and maximum available points.

Evidence:
Identify specific dialogue, claims, demonstrations, comparisons, or customer references that support the score.

Strengths:
Identify what the contestant did particularly well within that criterion.

Improvements:
Explain what additional or stronger contest-relevant content would have earned more points.

Do not repeat the same sentence across all four fields.

Do not invent evidence.

OVERALL COMMENT

Provide an Overall Judge Comment summarizing:

- overall effectiveness,
- customer focus,
- Cadillac EV product knowledge,
- quality of the sales story,
- conquest-selling effectiveness,
- professionalism,
- communication,
- and overall competitiveness.

Write this as an experienced contest judge.

Do not discuss the AI system or automated analysis in the Overall Judge Comment.

OPPORTUNITIES FOR IMPROVEMENT

Provide a separate improvementNotes field.

This should be a cohesive development plan focusing on the highest-value changes the contestant could make to improve a future Cadillac EV conquest presentation.

Prioritize meaningful sales and contest improvements rather than minor production details.

Do not merely repeat all six criterion improvement fields.

Do not recommend correcting something that appears to be an automated transcription or visual-analysis artifact.

Do not introduce external vehicle specifications, competitive facts, industry benchmarks, or technical standards unless they are contained in the attached reference documents or reliable submission evidence.

OUTPUT RULES

Return only one raw JSON object.

Do not include Markdown.

Do not include JSON code fences.

Do not include commentary before or after the JSON.

The first character of the response must be {
The final character of the response must be }

Return JSON matching this exact structure:

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

VIDEO STORYBOARD AND TRANSCRIPT

${pegasusOutput}
`.trim()

  const response = await client.send(
    new ConverseCommand({
      modelId,
      messages: [
        {
          role: 'user',
          content: [
            ...referenceDocuments,
            {
              text: prompt,
            },
          ],
        },
      ],
      inferenceConfig: {
        maxTokens: 8192,
      },
    })
  )

  const responseContent =
    response.output?.message?.content

  const text =
    getClaudeOutputText(responseContent)

  if (!text) {
    throw new Error(
      'Claude returned no text response.'
    )
  }

  const cleanedText = extractJson(text)

  let result: ClaudeJudgeResult

  try {
    result = JSON.parse(
      cleanedText
    ) as ClaudeJudgeResult
  } catch (error) {
    console.error(
      'Claude raw response text:',
      text
    )

    console.error(
      'Claude cleaned response text:',
      cleanedText
    )

    throw new Error(
      `Claude returned invalid JSON: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`
    )
  }

  validateJudgeResult(result)

  const rawResponse: ClaudeRawResponse = {
    stopReason:
      response.stopReason ?? null,

    outputText: text,

    usage: {
      inputTokens:
        response.usage?.inputTokens ??
        null,

      outputTokens:
        response.usage?.outputTokens ??
        null,

      totalTokens:
        response.usage?.totalTokens ??
        null,
    },

    metrics: {
      latencyMs:
        response.metrics?.latencyMs ??
        null,
    },
  }

  return {
    result,
    rawResponse,
    modelId,
  }
}