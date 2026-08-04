import { prisma } from '@/lib/prisma'

export const VOTE_PHASE_KEY = 'vote'
export const VOTE_CANDIDATES_PER_REGION = 5

export type VoteCandidate = {
  id: string
  processedS3Key: string
  originalFileName: string
  region: number
  district: number | null
  round1ScoreId: string
  round1TotalScore: string
  round1ScoredAt: string
  user: {
    email: string
    displayName: string | null
    firstName: string | null
    lastName: string | null
  }
}

export async function getEligibleVoteCandidates(): Promise<VoteCandidate[]> {
  const scores = await prisma.judgeRound1Score.findMany({
    where: {
      videoSubmission: {
        homeArea: {
          not: null,
        },
        processedS3Key: {
          not: null,
        },
      },
    },
    orderBy: [{ totalScore: 'desc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      totalScore: true,
      createdAt: true,
      videoSubmission: {
        select: {
          id: true,
          district: true,
          homeArea: true,
          processedS3Key: true,
          originalFileName: true,
          user: {
            select: {
              email: true,
              displayName: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  })

  const regionCounts = new Map<number, number>()
  const seenVideoIds = new Set<string>()
  const candidates: VoteCandidate[] = []

  for (const score of scores) {
    const video = score.videoSubmission

    if (
      !video?.id ||
      video.homeArea == null ||
      !video.processedS3Key ||
      seenVideoIds.has(video.id)
    ) {
      continue
    }

    const region = video.homeArea
    const currentRegionCount = regionCounts.get(region) ?? 0

    if (currentRegionCount >= VOTE_CANDIDATES_PER_REGION) {
      continue
    }

    seenVideoIds.add(video.id)
    regionCounts.set(region, currentRegionCount + 1)

    candidates.push({
      id: video.id,
      processedS3Key: video.processedS3Key,
      originalFileName: video.originalFileName,
      region,
      district: video.district,
      round1ScoreId: score.id,
      round1TotalScore: score.totalScore.toString(),
      round1ScoredAt: score.createdAt.toISOString(),
      user: {
        email: video.user.email,
        displayName: video.user.displayName,
        firstName: video.user.firstName,
        lastName: video.user.lastName,
      },
    })
  }

  return candidates.sort((a, b) => {
    if (a.region !== b.region) return a.region - b.region

    const scoreDelta = Number(b.round1TotalScore) - Number(a.round1TotalScore)
    if (scoreDelta !== 0) return scoreDelta

    return new Date(a.round1ScoredAt).getTime() - new Date(b.round1ScoredAt).getTime()
  })
}

export async function isEligibleVoteCandidate(videoSubmissionId: string) {
  const candidates = await getEligibleVoteCandidates()
  return candidates.some((candidate) => candidate.id === videoSubmissionId)
}
