import { NextRequest, NextResponse } from 'next/server'

import { getSessionRoles } from '@/lib/auth/access'
import { getCurrentSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

type PhaseUpdate = {
  id: string
  startsAt: string
  endsAt: string
}

export async function POST(request: NextRequest) {
  const session = await getCurrentSession()

  if (!session || !getSessionRoles(session.user).includes('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const phases = body.phases as PhaseUpdate[]

  if (!Array.isArray(phases)) {
    return NextResponse.json({ error: 'Invalid phases payload' }, { status: 400 })
  }

  for (const phase of phases) {
    if (!phase.id || !phase.startsAt || !phase.endsAt) {
      return NextResponse.json(
        { error: 'Each phase requires id, startsAt, and endsAt' },
        { status: 400 }
      )
    }

    const startsAt = new Date(phase.startsAt)
    const endsAt = new Date(phase.endsAt)

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      return NextResponse.json({ error: 'Invalid date value' }, { status: 400 })
    }

    if (startsAt >= endsAt) {
      return NextResponse.json(
        { error: 'Phase start date must be before end date' },
        { status: 400 }
      )
    }
  }

  await prisma.$transaction(
    phases.map((phase) =>
      prisma.phase.update({
        where: { id: phase.id },
        data: {
          startsAt: new Date(phase.startsAt),
          endsAt: new Date(phase.endsAt),
        },
      })
    )
  )

  return NextResponse.json({ success: true })
}