import { NextResponse } from 'next/server'

import { getCurrentSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getCurrentSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const submission = await prisma.videoSubmission.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        createdAt: true,
        originalFileName: true,
      },
    })

    return NextResponse.json({
      hasSubmitted: !!submission,
      submission,
    })
  } catch (err) {
    console.error('Upload status error:', err)
    return NextResponse.json(
      { error: 'Failed to load upload status' },
      { status: 500 }
    )
  }
}