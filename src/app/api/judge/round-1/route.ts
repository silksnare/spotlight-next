import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentSession } from '@/lib/auth/session'

export async function GET() {
  const session = await getCurrentSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const videos = await prisma.videoSubmission.findMany({
      where: {
        isQualified: true,
        processedS3Key: {
          not: null,
        },
        judgeRound1Scores: {
          none: {}, // 🔑 this is the key: not scored yet by anyone
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Judge Round 1 fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}