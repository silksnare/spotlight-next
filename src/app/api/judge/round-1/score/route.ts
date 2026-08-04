import { NextResponse } from 'next/server'

import { getCurrentSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'

type ScorePayload = {
  videoSubmissionId: string
  scores: {
    criterion1: number
    criterion2: number
    criterion3: number
    criterion4: number
    criterion5: number
    criterion6: number
  }
  comments?: string
}

const CRITERION_MAX_VALUES = {
  criterion1: 15,
  criterion2: 10,
  criterion3: 10,
  criterion4: 15,
  criterion5: 25,
  criterion6: 25,
} as const

export async function POST(request: Request) {
  const session = await getCurrentSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as ScorePayload

    const { videoSubmissionId, scores, comments } = body

    if (!videoSubmissionId) {
      return NextResponse.json(
        { error: 'videoSubmissionId is required' },
        { status: 400 },
      )
    }

    if (!scores) {
      return NextResponse.json(
        { error: 'Scores are required' },
        { status: 400 },
      )
    }

    const values = [
      scores.criterion1,
      scores.criterion2,
      scores.criterion3,
      scores.criterion4,
      scores.criterion5,
      scores.criterion6,
    ]

    const maxValues = [
      CRITERION_MAX_VALUES.criterion1,
      CRITERION_MAX_VALUES.criterion2,
      CRITERION_MAX_VALUES.criterion3,
      CRITERION_MAX_VALUES.criterion4,
      CRITERION_MAX_VALUES.criterion5,
      CRITERION_MAX_VALUES.criterion6,
    ]

    const hasInvalidScore = values.some((value, index) => {
      const max = maxValues[index]

      return (
        typeof value !== 'number' ||
        Number.isNaN(value) ||
        !Number.isInteger(value) ||
        value < 0 ||
        value > max
      )
    })

    if (hasInvalidScore) {
      return NextResponse.json(
        {
          error:
            'Scores must be whole numbers within each category maximum: 15, 10, 10, 15, 25, 25.',
        },
        { status: 400 },
      )
    }

    const trimmedComments =
      typeof comments === 'string' && comments.trim().length > 0
        ? comments.trim()
        : null

    const existingScore = await prisma.judgeRound1Score.findFirst({
      where: {
        videoSubmissionId,
      },
    })

    if (existingScore) {
      return NextResponse.json(
        { error: 'This video has already been judged' },
        { status: 409 },
      )
    }

    const totalScore = values.reduce((sum, value) => sum + value, 0)

    const score = await prisma.judgeRound1Score.create({
      data: {
        videoSubmissionId,
        judgeUserId: session.user.id,

        // Existing DB fields reused for Cadillac rubric:
        // criterion1 = Customer Profile Incorporated / 15
        // criterion2 = Introducing Your Cadillac EV / 10
        // criterion3 = High-Level Positioning / 10
        // criterion4 = Importance to Cadillac / 15
        // criterion5 = Reasons for Purchase / 25
        // criterion6 = Conquest Selling / Competitive Positioning / 25
        introductionGuestContext: scores.criterion1,
        explanationOfInspectionFindings: scores.criterion2,
        serviceRecommendationUrgency: scores.criterion3,
        communicationClarityProfessionalism: scores.criterion4,
        organizationVideoFlow: scores.criterion5,
        accuracyOfRecommendations: scores.criterion6,

        totalScore,
        comments: trimmedComments,
      },
    })

    return NextResponse.json({ success: true, score })
  } catch (error) {
    console.error('Judge Round 1 score save error:', error)

    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 },
    )
  }
}