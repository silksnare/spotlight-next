import { NextRequest, NextResponse } from 'next/server'

import { getCurrentSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'

const CRITERION_MAX_VALUES = {
  criterion1: 15,
  criterion2: 10,
  criterion3: 10,
  criterion4: 15,
  criterion5: 25,
  criterion6: 25,
} as const

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'judge2' && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { videoSubmissionId, scores } = body

    if (!videoSubmissionId || !scores) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    const c1 = Number(scores.criterion1)
    const c2 = Number(scores.criterion2)
    const c3 = Number(scores.criterion3)
    const c4 = Number(scores.criterion4)
    const c5 = Number(scores.criterion5)
    const c6 = Number(scores.criterion6)

    const values = [c1, c2, c3, c4, c5, c6]

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

    const totalScore = values.reduce((sum, value) => sum + value, 0)

    await prisma.judgeRound2Score.upsert({
      where: {
        videoSubmissionId_judgeUserId: {
          videoSubmissionId,
          judgeUserId: session.user.id,
        },
      },
      update: {
        introductionGuestContext: c1,
        explanationOfInspectionFindings: c2,
        serviceRecommendationUrgency: c3,
        communicationClarityProfessionalism: c4,
        organizationVideoFlow: c5,
        accuracyOfRecommendations: c6,
        totalScore,
      },
      create: {
        videoSubmissionId,
        judgeUserId: session.user.id,
        introductionGuestContext: c1,
        explanationOfInspectionFindings: c2,
        serviceRecommendationUrgency: c3,
        communicationClarityProfessionalism: c4,
        organizationVideoFlow: c5,
        accuracyOfRecommendations: c6,
        totalScore,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Round 2 score error:', err)
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 },
    )
  }
}