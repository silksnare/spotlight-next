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

  if (!Number.isInteger(score * 4)) {
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
    throw new Error(
      `${String(fieldName)} must be a non-empty string.`
    )
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
    validateScore(result[fieldName] as number, fieldName)
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

  if (result.totalScore < 0 || result.totalScore > 18) {
    throw new Error(
      'totalScore must be between 0.00 and 18.00.'
    )
  }

  if (!Number.isInteger(result.totalScore * 4)) {
    throw new Error(
      'totalScore must use increments of 0.25.'
    )
  }

  if (Math.abs(result.totalScore - calculatedTotal) > 0.001) {
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

async function loadReferenceDocuments(): Promise<ContentBlock[]> {
  const documentsDirectory = path.join(
    process.cwd(),
    'public',
    'documents'
  )

  return Promise.all(
    REFERENCE_DOCUMENTS.map(
      async ({ filename, documentName }): Promise<ContentBlock> => {
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
      if ('text' in block && typeof block.text === 'string') {
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
  const region = process.env.AWS_REGION || 'us-east-1'
  const modelId = process.env.AWS_BEDROCK_CLAUDE_MODEL_ID

  if (!modelId) {
    throw new Error('Missing AWS_BEDROCK_CLAUDE_MODEL_ID')
  }

  if (!pegasusOutput.trim()) {
    throw new Error('Pegasus output is empty.')
  }

  const referenceDocuments =
    await loadReferenceDocuments()

  const client = new BedrockRuntimeClient({
    region,
  })

  const prompt = `
You are serving as an official contest judge evaluating a submitted vehicle inspection video.

The following reference documents are attached to this request:

1. Official Rules
2. Judging Rubric
3. Best Practices

Treat those documents as the authoritative basis for the evaluation.

Apply the Official Rules and Judging Rubric exactly as written. Use the Best Practices document to help distinguish average submissions from stronger and more competitive submissions.

Do not replace the requirements in the attached documents with your own generalized judging standards.

Do not deduct points merely because an optional enhancement, coaching opportunity, or best practice was absent unless the Official Rules or Judging Rubric support that deduction.

You may still identify optional enhancements in the strengths and improvement fields, but scoring must remain grounded in the attached Official Rules and Judging Rubric.

Evaluate the submission using only:

- The attached reference documents
- The supplied video storyboard
- The supplied video transcript

IMPORTANT EVIDENCE RELIABILITY INSTRUCTIONS

The supplied Storyboard and Transcript were generated by an automated video-analysis system.

The automated video-analysis system is an evidence-extraction layer. It may occasionally introduce transcription errors, phonetic substitutions, visual-reading errors, OCR errors, incorrect units, or uncertain interpretations of what is shown in the video.

Judge the contestant's demonstrated inspection process and communication. Do not judge the accuracy of the automated video-analysis system itself.

Do not penalize the contestant for an apparent error when the surrounding evidence strongly indicates that the error was introduced by automated transcription or visual analysis.

Examples include:

- An automotive term being transcribed as a phonetically similar non-automotive word
- A dealership or brand name being transcribed incorrectly
- A numerical measurement having an implausible transcribed unit
- A visually extracted odometer, gauge, screen, or measurement value that conflicts with stronger contextual evidence
- A tool or action being described with a function that is not clearly supported by the surrounding evidence

For example, if a tire tread measurement is transcribed as "7.30 seconds," do not assume the technician actually communicated tire tread depth in seconds. Treat the word "seconds" as a probable automated transcription error unless other evidence establishes that the technician actually used an incorrect unit.

Likewise, a transcription such as an incorrect dealership or brand name should not reduce Communication Clarity & Professionalism when the error is reasonably attributable to automated transcription.

Do not silently invent a replacement value, unit, term, name, action, or statement.

Instead, treat the questionable portion as uncertain and evaluate only the reliable evidence that remains.

EVIDENCE WEIGHTING

Give greatest evidentiary weight to information that is internally consistent and supported by multiple parts of the Storyboard and Transcript.

When evaluating evidence, use the following principles:

1. Explicit spoken statements that are clear and internally consistent may be treated as evidence.

2. Clearly described visual actions and objects may be treated as evidence.

3. A measurement that is both verbally stated and independently supported by clearly described visual evidence may be treated as especially strong evidence.

4. A visual numerical value produced by automated video analysis should not automatically override a clear spoken statement.

5. If the Storyboard and Transcript conflict, do not automatically assume that either source is correct.

6. When a conflict appears likely to result from automated transcription, OCR, visual recognition, or interpretation, treat the disputed detail as uncertain rather than penalizing the contestant.

7. Do not infer a defect, mistake, incorrect recommendation, incorrect measurement, or communication failure solely from an apparent inconsistency created by the automated evidence-extraction process.

8. Do not use an uncertain or contradictory extracted detail as the sole basis for a score deduction.

9. If enough reliable evidence remains to evaluate the criterion fairly, score the criterion using that reliable evidence.

10. If evidence relevant to a criterion is genuinely absent, score that absence according to the attached Judging Rubric. Do not confuse absent evidence with unreliable extracted evidence.

Do not assume the existence of information, actions, measurements, tools, visual evidence, explanations, recommendations, or guest interactions that are not explicitly present.

Do not manufacture missing evidence in order to resolve an ambiguity.

If the Storyboard states that something is visibly shown, you may consider that evidence present unless the Storyboard itself indicates that the observation or value is uncertain.

If a recommendation is made without supporting visual evidence or explanation, score it according to the attached rubric.

Maintain a professional, objective contest-judging tone.

SCORING REQUIREMENTS

- Score each criterion from 0.00 through 3.00.
- Use increments of 0.25 only.
- Apply the scoring levels and standards from the attached Judging Rubric.
- Support every score with specific reliable evidence from the Storyboard or Transcript.
- Avoid both score inflation and unsupported deductions.
- Judge the submission as a competitive contest entry.
- The total score must exactly equal the sum of all six criterion scores.
- A coaching opportunity does not automatically justify a score deduction.
- An apparent automated transcription, OCR, or visual-analysis error does not automatically justify a score deduction.
- Explain what earned the score and, when applicable, what rubric-supported weakness prevented a higher score.
- Do not lower a score merely because the automated evidence-extraction system produced an uncertain or obviously implausible word, unit, name, or visual reading.
- Do not increase a score by assuming that missing required evidence probably occurred in the original video.

CRITERIA

1. Introduction & Guest Context
2. Explanation of Inspection Findings
3. Service Recommendation & Urgency
4. Communication Clarity & Professionalism
5. Organization & Video Flow
6. Accuracy of Recommendations

CRITERION-SPECIFIC EVIDENCE HANDLING

For Introduction & Guest Context:
Evaluate what the contestant communicates about themselves, the guest, vehicle, service context, and inspection purpose according to the rubric. Do not penalize a contestant for a likely automated transcription error in a name, dealership, brand, or automotive term.

For Explanation of Inspection Findings:
Evaluate the inspection findings, measurements, explanations, and supporting evidence actually demonstrated. When a numerical unit appears obviously inconsistent with the automotive context, treat the questionable unit as uncertain rather than automatically treating the inspection finding itself as incorrect.

For Service Recommendation & Urgency:
Evaluate whether recommendations are clearly communicated and appropriately supported according to the rubric. Do not invent urgency, recommendations, or supporting evidence that is not present.

For Communication Clarity & Professionalism:
Evaluate the contestant's apparent communication, organization of spoken information, professionalism, and guest-facing explanations. Do not penalize speech quality for obvious automated transcription artifacts.

For Organization & Video Flow:
Evaluate the structure and progression demonstrated by the Storyboard and Transcript. Do not treat minor wording errors from automated transcription as organizational defects.

For Accuracy of Recommendations:
Evaluate whether the recommendations are supported by the reliable inspection evidence available. Do not declare a recommendation technically inaccurate solely because of a questionable OCR reading, transcription artifact, or uncertain automated visual interpretation.

FOR EACH CRITERION, RETURN

1. Numeric score
2. Detailed explanation of why that score was assigned
3. Specific supporting evidence
4. Strengths demonstrated
5. Practical opportunities for improvement

Keep these fields distinct:

- Explanation: why the score was assigned under the rubric
- Evidence: concrete reliable dialogue, measurements, visuals, or actions
- Strengths: what was done effectively
- Improvements: specific ways the submission could become stronger

Do not repeat identical sentences across these fields.

When citing evidence in the Evidence fields, avoid presenting an uncertain automated transcription or visual reading as an established fact.

When an uncertain detail is relevant, explicitly identify the uncertainty.

OVERALL COMMENT

Provide a detailed Overall Judge Comment written from the perspective of an experienced contest judge.

The comment should summarize:

- The overall effectiveness of the submission
- The guest experience it creates
- How well it demonstrates the value of the inspection process
- How effectively it builds guest trust and understanding
- Its overall competitiveness

The Overall Judge Comment should focus on the contestant's performance and should not criticize the automated Storyboard or Transcript.

OPPORTUNITIES FOR IMPROVEMENT

Provide a separate improvementNotes field containing a cohesive development plan.

Do not merely repeat all six criterion improvement fields. Prioritize the most meaningful practical changes that would improve future contest performance.

Only recommend changes that are supported by the reliable evidence and attached judging materials.

Do not recommend that the contestant correct something when the supposed problem is reasonably attributable to automated transcription, OCR, or visual analysis.

When identifying an apparent transcription artifact, do not replace the uncertain word or phrase with your own inferred wording. State only that the extracted wording appears uncertain and do not use it as the basis for a deduction.

Do not introduce external technical thresholds, specifications, service intervals, measurement benchmarks, or automotive standards unless they are explicitly contained in the attached reference documents or supplied submission evidence.

OUTPUT RULES

Return only one raw JSON object.

Do not include Markdown.
Do not include JSON code fences.
Do not include commentary before or after the JSON.
The first character must be {
The final character must be }

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

  const text = getClaudeOutputText(responseContent)

  if (!text) {
    throw new Error('Claude returned no text response.')
  }

  const cleanedText = extractJson(text)

  let result: ClaudeJudgeResult

  try {
    result = JSON.parse(
      cleanedText
    ) as ClaudeJudgeResult
  } catch (error) {
    console.error('Claude raw response text:', text)
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
    stopReason: response.stopReason ?? null,
    outputText: text,
    usage: {
      inputTokens:
        response.usage?.inputTokens ?? null,
      outputTokens:
        response.usage?.outputTokens ?? null,
      totalTokens:
        response.usage?.totalTokens ?? null,
    },
    metrics: {
      latencyMs:
        response.metrics?.latencyMs ?? null,
    },
  }

  return {
    result,
    rawResponse,
    modelId,
  }
}