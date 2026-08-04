'use client'

import { useMemo, useState } from 'react'

type VoteCandidate = {
  id: string
  videoUrl: string | null
  originalFileName: string
  region: number
  district: number | null
  round1TotalScore: string
  user: {
    email: string
    displayName: string | null
    firstName: string | null
    lastName: string | null
  }
}

type VoteClientProps = {
  initialCandidates: VoteCandidate[]
  initialSelectedVideoId: string | null
}

function getSubmitterName(user: VoteCandidate['user']) {
  const displayName = user.displayName?.trim()
  if (displayName) return displayName

  const fullName = [user.firstName, user.lastName]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' ')

  return fullName || user.email
}

export default function VoteClient({
  initialCandidates,
  initialSelectedVideoId,
}: VoteClientProps) {
  const [selectedVideoId, setSelectedVideoId] = useState(initialSelectedVideoId)
  const [confirmingCandidate, setConfirmingCandidate] = useState<VoteCandidate | null>(null)
  const [showThankYou, setShowThankYou] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const candidatesByRegion = useMemo(() => {
    return initialCandidates.reduce<Record<number, VoteCandidate[]>>((groups, candidate) => {
      groups[candidate.region] = groups[candidate.region] ?? []
      groups[candidate.region].push(candidate)
      return groups
    }, {})
  }, [initialCandidates])

  const regionCount = Object.keys(candidatesByRegion).length

  function openConfirm(candidate: VoteCandidate) {
    if (candidate.id === selectedVideoId || submitting) return
    setErrorMessage(null)
    setConfirmingCandidate(candidate)
  }

  function closeConfirm() {
    if (submitting) return
    setConfirmingCandidate(null)
  }

  async function confirmVote() {
    if (!confirmingCandidate) return

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoSubmissionId: confirmingCandidate.id,
        }),
      })

      const payload = (await response.json().catch(() => null)) as {
        error?: string
        videoSubmissionId?: string
      } | null

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Failed to save vote')
      }

      setSelectedVideoId(payload?.videoSubmissionId ?? confirmingCandidate.id)
      setConfirmingCandidate(null)
      setShowThankYou(true)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save vote')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-[#f4f4f4]">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
        <div className="">
          <p className="font-[family:var(--font-cadillac)] text-[12px] font-bold uppercase tracking-[0.45em] text-[#231f24]">
            Recognize Peers
          </p>
          <h1 className="mt-4 font-[family:var(--font-cadillac)] text-[30px] font-bold uppercase tracking-[0.18em] text-[#231f24] sm:text-[42px]">
            Vote For Your Favorite
          </h1>
          <p className="mt-5 text-base leading-7 text-[#3b363d]">
            Review the featured regional submissions and select the video that best represents the Cadillac EV experience. You may change your vote any time until the voting phase closes.
          </p>
        </div>

        {initialCandidates.length === 0 ? (
          <div className="mt-12 border border-[#d6d6d6] bg-white p-8 text-[#231f24]">
            <h2 className="font-[family:var(--font-cadillac)] text-lg font-bold uppercase tracking-[0.18em]">
              No Videos Available
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#4a454b]">
              Peer Choice voting is active, but no eligible regional submissions are available yet.
            </p>
          </div>
        ) : (
          <>
            {/*<div className="mt-10 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#231f24]">
              <span className="border border-[#d6d6d6] bg-white px-4 py-3">
                {initialCandidates.length} Featured Videos
              </span>
              <span className="border border-[#d6d6d6] bg-white px-4 py-3">
                {regionCount} Regions
              </span>
            </div>*/}

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {initialCandidates.map((candidate) => {
                const isSelected = candidate.id === selectedVideoId
                const submitterName = getSubmitterName(candidate.user)

                return (
                  <article
                    key={candidate.id}
                    className={`border bg-white ${
                      isSelected ? 'border-[#231f24]' : 'border-[#d6d6d6]'
                    }`}
                  >
                    <div className="aspect-video bg-[#231f24]">
                      {candidate.videoUrl ? (
                        <video
                          controls
                          controlsList="nodownload"
                          preload="metadata"
                          src={candidate.videoUrl}
                          className="h-full w-full bg-black object-contain"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-6 text-center text-sm uppercase tracking-[0.2em] text-white">
                          Video unavailable
                        </div>
                      )}
                    </div>

                    <div className="space-y-5 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {/*<p className="font-[family:var(--font-cadillac)] text-[11px] font-bold uppercase tracking-[0.36em] text-[#6b656d]">
                            Region {candidate.region}
                          </p>*/}
                          <h2 className="mt-2 font-[family:var(--font-cadillac)] text-lg font-bold uppercase tracking-[0.16em] text-[#231f24]">
                            {submitterName}
                          </h2>
                        </div>
                        {isSelected ? (
                          <span className="border border-[#231f24] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#231f24]">
                            Current Vote
                          </span>
                        ) : null}
                      </div>

                      <dl className="grid gap-2 text-sm text-[#4a454b]">
                        {/*<div className="flex justify-between gap-4 border-t border-[#e6e6e6] pt-3">
                          <dt className="uppercase tracking-[0.18em] text-[#6b656d]">Submitter</dt>
                          <dd className="text-right">{candidate.user.email}</dd>
                        </div>*/}
                        {/*{candidate.district != null ? (
                          <div className="flex justify-between gap-4 border-t border-[#e6e6e6] pt-3">
                            <dt className="uppercase tracking-[0.18em] text-[#6b656d]">District</dt>
                            <dd>{candidate.district}</dd>
                          </div>
                        ) : null}*/}
                      </dl>

                      <button
                        type="button"
                        onClick={() => openConfirm(candidate)}
                        disabled={isSelected || submitting}
                        className={`w-full px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] transition ${
                          isSelected
                            ? 'border border-[#231f24] bg-white text-[#231f24]'
                            : 'bg-[#231f24] text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-[#6b656d]'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select Winner'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </div>

      {confirmingCandidate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 py-10">
          <div className="w-full max-w-lg border border-[#d6d6d6] bg-white p-8 text-[#231f24]">
            <p className="font-[family:var(--font-cadillac)] text-[11px] font-bold uppercase tracking-[0.36em] text-[#6b656d]">
              Region {confirmingCandidate.region}
            </p>
            <h2 className="mt-3 font-[family:var(--font-cadillac)] text-2xl font-bold uppercase tracking-[0.18em]">
              Confirm Your Vote
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#4a454b]">
              You are about to select this video as your Peer Choice vote. You may change your vote any time before voting closes.
            </p>
            {errorMessage ? (
              <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeConfirm}
                disabled={submitting}
                className="border border-[#231f24] px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] text-[#231f24] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmVote}
                disabled={submitting}
                className="bg-[#231f24] px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-[#6b656d]"
              >
                {submitting ? 'Saving...' : 'Confirm Vote'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showThankYou ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 py-10">
          <div className="w-full max-w-lg border border-[#d6d6d6] bg-white p-8 text-[#231f24]">
            <h2 className="font-[family:var(--font-cadillac)] text-2xl font-bold uppercase tracking-[0.18em]">
              Thank You For Voting
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#4a454b]">
              Your vote has been saved. You may return to this page and change your vote any time before the voting phase closes.
            </p>
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setShowThankYou(false)}
                className="bg-[#231f24] px-5 py-3 text-sm font-bold uppercase tracking-[0.24em] text-white hover:bg-black"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
