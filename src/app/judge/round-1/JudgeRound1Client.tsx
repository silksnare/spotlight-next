'use client'

import { useState } from 'react'

type JudgeRound1ClientProps = {
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
  { label: 'Customer Profile Incorporated', max: 15 },
  { label: 'Introducing Your Cadillac EV', max: 10 },
  { label: 'High-Level Positioning', max: 10 },
  { label: 'Importance to Cadillac', max: 15 },
  { label: 'Reasons for Purchase', max: 25 },
  { label: 'Conquest Selling / Competitive Positioning', max: 25 },
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

export default function JudgeRound1Client({
  initialVideos,
}: JudgeRound1ClientProps) {
  const [videos, setVideos] = useState(initialVideos)

  const [scoresByVideo, setScoresByVideo] = useState<Record<string, ScoreState>>(
    () =>
      Object.fromEntries(
        initialVideos.map((video) => [video.id, { ...defaultScores }]),
      ),
  )

  const [commentsByVideo, setCommentsByVideo] = useState<Record<string, string>>(
    () => Object.fromEntries(initialVideos.map((video) => [video.id, ''])),
  )

  const [submittingVideoId, setSubmittingVideoId] = useState<string | null>(null)
  const [confirmingVideoId, setConfirmingVideoId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function updateScore(
    videoId: string,
    criterion: CriterionKey,
    value: number,
  ) {
    setScoresByVideo((prev) => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        [criterion]: value,
      },
    }))
  }

  function updateComment(videoId: string, value: string) {
    setCommentsByVideo((prev) => ({
      ...prev,
      [videoId]: value,
    }))
  }

  function openConfirmModal(videoId: string) {
    setErrorMessage(null)
    setConfirmingVideoId(videoId)
  }

  function closeConfirmModal() {
    if (submittingVideoId) return
    setConfirmingVideoId(null)
  }

  async function submitScore(videoId: string) {
    const scoreSet = scoresByVideo[videoId]

    if (!scoreSet) {
      setErrorMessage('No scores found for this video.')
      return
    }

    setSubmittingVideoId(videoId)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/judge/round-1/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoSubmissionId: videoId,
          scores: scoreSet,
          comments: commentsByVideo[videoId] ?? '',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save score.')
      }

      setVideos((prev) => prev.filter((video) => video.id !== videoId))
      setConfirmingVideoId(null)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to save score.',
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
          <h1 className="page-title">JUDGE ROUND 1</h1>

          <p className="mb-2">
            Videos to be judged:{' '}
            <span className="font-bold">{videos.length}</span>
          </p>

          <p className="mb-2">
            Score each category in whole-number increments. Total possible score
            is <strong>100 points</strong>. Select the link for detailed{' '}
            <strong>
              <a
                href="/documents/EV-Walkaround-Rubric.pdf"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Judging Criteria
              </a>
            </strong>
            .
          </p>
        </div>

        {errorMessage ? (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="space-y-10">
          {videos.map((video) => {
            const scoreSet = scoresByVideo[video.id] ?? defaultScores
            const totalScore = Object.values(scoreSet).reduce(
              (sum, value) => sum + value,
              0,
            )

            const scoreEntries: Array<{
              key: CriterionKey
              label: string
              max: number
            }> = [
              {
                key: 'criterion1',
                label: criteria[0].label,
                max: criteria[0].max,
              },
              {
                key: 'criterion2',
                label: criteria[1].label,
                max: criteria[1].max,
              },
              {
                key: 'criterion3',
                label: criteria[2].label,
                max: criteria[2].max,
              },
              {
                key: 'criterion4',
                label: criteria[3].label,
                max: criteria[3].max,
              },
              {
                key: 'criterion5',
                label: criteria[4].label,
                max: criteria[4].max,
              },
              {
                key: 'criterion6',
                label: criteria[5].label,
                max: criteria[5].max,
              },
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
                    {video.user?.homeArea !== null ? (
                      <> | Region: {video.user.homeArea}</>
                    ) : null}
                  </div>
                </div>

                <div className="border border-neutral-200 bg-neutral-50 p-5">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">
                        Score Submission
                      </h2>
                    </div>

                    <div className="bg-white px-4 py-3 text-right shadow-sm ring-1 ring-neutral-200">
                      <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                        Total
                      </div>
                      <div className="text-2xl font-bold leading-none">
                        {totalScore} / 100
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

                          <span className="min-w-16 text-right text-sm font-semibold text-neutral-700">
                            {scoreSet[item.key]} / {item.max}
                          </span>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max={item.max}
                          step="1"
                          value={scoreSet[item.key]}
                          onChange={(event) =>
                            updateScore(
                              video.id,
                              item.key,
                              Number(event.target.value),
                            )
                          }
                          className="w-full slider"
                          disabled={isSubmitting}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor={`comments-${video.id}`}
                      className="mb-2 block text-sm font-medium text-neutral-900"
                    >
                      Judge Comments
                    </label>

                    <textarea
                      id={`comments-${video.id}`}
                      rows={4}
                      value={commentsByVideo[video.id] ?? ''}
                      onChange={(event) =>
                        updateComment(video.id, event.target.value)
                      }
                      disabled={isSubmitting}
                      placeholder="Optional comments about this submission..."
                      className="w-full border border-neutral-300 bg-white p-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
                    />
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

      {confirmingVideo ? (
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
      ) : null}
    </div>
  )
}