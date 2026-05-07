'use client'

import { useState } from 'react'

type JudgeRound2ClientProps = {
  judgeRegion: number | null
  targetRegion: number | null
  errorMessage?: string | null
  initialVideos: Array<{
    id: string
    processedS3Key: string | null
    videoUrl: string | null
    user: {
      email: string
      homeArea: number | null
      displayName: string | null
      firstName: string | null
      lastName: string | null
    }
  }>
}

const criteria = [
  'Introduction & Guest Context',
  'Explanation of Inspection Findings',
  'Service Recommendation & Urgency',
  'Communication Clarity & Professionalism',
  'Organization & Video Flow',
  'Accuracy of Recommendations',
] as const

type CriterionKey =
  | 'criterion1'
  | 'criterion2'
  | 'criterion3'
  | 'criterion4'
  | 'criterion5'
  | 'criterion6'

type ScoreState = Record<CriterionKey, number>

const defaultScores: ScoreState = {
  criterion1: 0,
  criterion2: 0,
  criterion3: 0,
  criterion4: 0,
  criterion5: 0,
  criterion6: 0,
}

export default function JudgeRound2Client({
  judgeRegion,
  targetRegion,
  errorMessage = null,
  initialVideos,
}: JudgeRound2ClientProps) {
  const [videos, setVideos] = useState(initialVideos)
  const [scoresByVideo, setScoresByVideo] = useState<Record<string, ScoreState>>(
    () =>
      Object.fromEntries(
        initialVideos.map((video) => [video.id, { ...defaultScores }])
      )
  )
  const [submittingVideoId, setSubmittingVideoId] = useState<string | null>(null)
  const [confirmingVideoId, setConfirmingVideoId] = useState<string | null>(null)
  const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(null)

  function updateScore(
    videoId: string,
    criterion: CriterionKey,
    value: number
  ) {
    setScoresByVideo((prev) => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        [criterion]: value,
      },
    }))
  }

  function openConfirmModal(videoId: string) {
    setLocalErrorMessage(null)
    setConfirmingVideoId(videoId)
  }

  function closeConfirmModal() {
    if (submittingVideoId) return
    setConfirmingVideoId(null)
  }

  async function submitScore(videoId: string) {
    const scoreSet = scoresByVideo[videoId]

    if (!scoreSet) {
      setLocalErrorMessage('No scores found for this video.')
      return
    }

    setSubmittingVideoId(videoId)
    setLocalErrorMessage(null)

    try {
      const response = await fetch('/api/judge/round-2/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoSubmissionId: videoId,
          scores: scoreSet,
        }),
      })

      const responseText = await response.text()

      let data: { error?: string } | null = null

      try {
        data = responseText ? JSON.parse(responseText) : null
      } catch {
        throw new Error(responseText || 'Non-JSON response from server')
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to save score.')
      }

      setVideos((prev) => prev.filter((video) => video.id !== videoId))
      setConfirmingVideoId(null)
    } catch (error) {
      setLocalErrorMessage(
        error instanceof Error ? error.message : 'Failed to save score.'
      )
    } finally {
      setSubmittingVideoId(null)
    }
  }

  const confirmingVideo =
    videos.find((video) => video.id === confirmingVideoId) ?? null

  return (
    <div className="page-container">
      <div className="space-y-8">
        <div>
          <h1 className="page-title">JUDGE ROUND 2</h1>
          <p className="mb-2">
            Videos to be judged:{' '}
            <span className="font-bold">{videos.length}</span>
          </p>

          <p className="mb-2">Score each category from 0.00 to 3:00. Select the link for detailed <strong><a href="https://actdevpprd.biworldwide.com/lexus/26MPI_Judging.pdf" target="_blank" className="underline">Judging Criteria</a></strong>.</p>
        </div>

        {(errorMessage || localErrorMessage) && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage || localErrorMessage}
          </div>
        )}

        <div className="space-y-10">
          {videos.map((video) => {
            const scoreSet = scoresByVideo[video.id] ?? defaultScores
            const totalScore = Object.values(scoreSet).reduce(
              (sum, value) => sum + value,
              0
            )

            const scoreEntries: Array<{
              key: CriterionKey
              label: (typeof criteria)[number]
            }> = [
              { key: 'criterion1', label: criteria[0] },
              { key: 'criterion2', label: criteria[1] },
              { key: 'criterion3', label: criteria[2] },
              { key: 'criterion4', label: criteria[3] },
              { key: 'criterion5', label: criteria[4] },
              { key: 'criterion6', label: criteria[5] },
            ]

            const isSubmitting = submittingVideoId === video.id

            return (
              <div
                key={video.id}
                className="grid grid-cols-1 gap-8 border border-neutral-200 bg-white p-6 shadow-sm lg:grid-cols-[1.1fr_0.9fr]"
              >
                <div className="space-y-4">
                  <div className="overflow-hidden bg-black">
                    <video
                      controls
                      className="w-full"
                      src={video.videoUrl ?? undefined}
                    />
                  </div>

                  <div className="text-sm text-neutral-600">
                    Uploaded by:{' '}
                    <span className="font-medium">{video.user?.email}</span>
                    {video.user?.homeArea !== null && (
                      <>
                        {' '}
                        | Region: {video.user.homeArea}
                      </>
                    )}
                  </div>
                </div>

                <div className="border border-neutral-200 bg-neutral-50 p-5">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">
                        Score Submission
                      </h2>
                      <p className="mt-1 text-sm text-neutral-600">
                        Score each category from 0.00 to 3.00.
                      </p>
                    </div>

                    <div className="bg-white px-4 py-3 text-right shadow-sm ring-1 ring-neutral-200">
                      <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                        Total
                      </div>
                      <div className="text-2xl font-bold leading-none">
                        {totalScore.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {scoreEntries.map((item) => (
                      <div key={item.key} className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <label className="text-sm font-medium text-neutral-900">
                            {item.label}
                          </label>
                          <span className="min-w-12 text-right text-sm font-semibold text-neutral-700">
                            {scoreSet[item.key].toFixed(2)}
                          </span>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="3"
                          step="0.25"
                          value={scoreSet[item.key]}
                          onChange={(event) =>
                            updateScore(
                              video.id,
                              item.key,
                              Number(event.target.value)
                            )
                          }
                          className="w-full slider"
                          disabled={isSubmitting}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => openConfirmModal(video.id)}
                      disabled={isSubmitting}
                      className="inline-flex items-center bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      SUBMIT SCORE
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {confirmingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-md bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-neutral-900">
              Submit score?
            </h2>

            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Are you sure you are done scoring this video? Once submitted, it
              will be removed from your queue.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirmModal}
                disabled={submittingVideoId === confirmingVideo.id}
                className="inline-flex items-center border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => submitScore(confirmingVideo.id)}
                disabled={submittingVideoId === confirmingVideo.id}
                className="inline-flex items-center bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submittingVideoId === confirmingVideo.id
                  ? 'SAVING...'
                  : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}