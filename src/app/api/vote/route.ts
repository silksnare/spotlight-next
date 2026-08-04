import { NextResponse } from 'next/server'

import { getCurrentSession } from '@/lib/auth/session'
import { isPhaseActiveFromDb } from '@/lib/phases/is-phase-active-from-db'
import { prisma } from '@/lib/prisma'
import { isEligibleVoteCandidate, VOTE_PHASE_KEY } from '@/lib/vote/candidates'

type VotePayload = {
  videoSubmissionId?: unknown
}

export async function POST(request: Request) {
  const session = await getCurrentSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const votePhaseActive = await isPhaseActiveFromDb(VOTE_PHASE_KEY)

  if (!votePhaseActive) {
    return NextResponse.json(
      { error: 'Voting is not currently active' },
      { status: 403 }
    )
  }

  let body: VotePayload

  try {
    body = (await request.json()) as VotePayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const videoSubmissionId = body.videoSubmissionId

  if (typeof videoSubmissionId !== 'string' || videoSubmissionId.length === 0) {
    return NextResponse.json(
      { error: 'videoSubmissionId is required' },
      { status: 400 }
    )
  }

  const eligible = await isEligibleVoteCandidate(videoSubmissionId)

  if (!eligible) {
    return NextResponse.json(
      { error: 'Video is not eligible for Peer Choice voting' },
      { status: 400 }
    )
  }

  await prisma.peerChoiceVote.upsert({
    where: {
      voterUserId: session.user.id,
    },
    update: {
      videoSubmissionId,
    },
    create: {
      voterUserId: session.user.id,
      videoSubmissionId,
    },
  })

  return NextResponse.json({ success: true, videoSubmissionId })
}
