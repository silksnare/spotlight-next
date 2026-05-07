import { NextRequest, NextResponse } from 'next/server'

import { getCurrentSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'

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
        { status: 400 }
      )
    }

    const c1 = Number(scores.criterion1 ?? 0)
    const c2 = Number(scores.criterion2 ?? 0)
    const c3 = Number(scores.criterion3 ?? 0)
    const c4 = Number(scores.criterion4 ?? 0)
    const c5 = Number(scores.criterion5 ?? 0)
    const c6 = Number(scores.criterion6 ?? 0)

    const totalScore = c1 + c2 + c3 + c4 + c5 + c6

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
      { status: 500 }
    )
  }
}