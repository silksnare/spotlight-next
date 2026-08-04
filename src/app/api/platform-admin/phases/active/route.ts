import { NextRequest, NextResponse } from 'next/server'

import { getCurrentSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'

const ALLOWED_PHASES = ['upload', 'judge_round_1', 'judge_round_2', 'vote'] as const

function getPhaseLabel(phaseKey: string) {
  if (phaseKey === 'upload') return 'Upload'
  if (phaseKey === 'judge_round_1') return 'Judge Round 1'
  if (phaseKey === 'judge_round_2') return 'Judge Round 2'
  return 'Vote'
}

export async function POST(request: NextRequest) {
  const session = await getCurrentSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { phaseKey } = await request.json()

  if (!ALLOWED_PHASES.includes(phaseKey)) {
    return NextResponse.json({ error: 'Invalid phase' }, { status: 400 })
  }

  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7)

  await prisma.$transaction([
    prisma.phase.updateMany({
      data: {
        isActive: false,
      },
    }),

    prisma.phase.upsert({
      where: {
        key: phaseKey,
      },
      update: {
        isActive: true,
        startsAt: now,
        endsAt: sevenDaysFromNow,
      },
      create: {
        key: phaseKey,
        label: getPhaseLabel(phaseKey),
        isActive: true,
        startsAt: now,
        endsAt: sevenDaysFromNow,
      },
    }),
  ])

  return NextResponse.json({ success: true })
}