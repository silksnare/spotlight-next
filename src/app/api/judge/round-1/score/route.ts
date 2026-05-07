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
}

export async function POST(request: Request) {
  const session = await getCurrentSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as ScorePayload

    const {
      videoSubmissionId,
      scores: {
        criterion1,
        criterion2,
        criterion3,
        criterion4,
        criterion5,
        criterion6,
      },
    } = body

    if (!videoSubmissionId) {
      return NextResponse.json(
        { error: 'videoSubmissionId is required' },
        { status: 400 }
      )
    }

    const values = [
      criterion1,
      criterion2,
      criterion3,
      criterion4,
      criterion5,
      criterion6,
    ]

    const hasInvalidScore = values.some(
      (value) =>
        typeof value !== 'number' ||
        Number.isNaN(value) ||
        value < 0 ||
        value > 3
    )

    if (hasInvalidScore) {
      return NextResponse.json(
        { error: 'Scores must be numbers between 0 and 3' },
        { status: 400 }
      )
    }

    const existingScore = await prisma.judgeRound1Score.findFirst({
      where: {
        videoSubmissionId,
      },
    })

    if (existingScore) {
      return NextResponse.json(
        { error: 'This video has already been judged' },
        { status: 409 }
      )
    }

    const totalScore = values.reduce((sum, value) => sum + value, 0)

    const score = await prisma.judgeRound1Score.create({
      data: {
        videoSubmissionId,
        judgeUserId: session.user.id,
        introductionGuestContext: criterion1,
        explanationOfInspectionFindings: criterion2,
        serviceRecommendationUrgency: criterion3,
        communicationClarityProfessionalism: criterion4,
        organizationVideoFlow: criterion5,
        accuracyOfRecommendations: criterion6,
        totalScore,
      },
    })

    return NextResponse.json({ success: true, score })
  } catch (error) {
    console.error('Judge Round 1 score save error:', error)

    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    )
  }
}