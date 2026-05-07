'use client';

import { useEffect, useState } from 'react';

type QualifyVideo = {
  id: string;
  userId: string;
  email: string | null;
  originalFileName: string;
  processedS3Key: string | null;
  videoUrl: string | null;
  createdAt: string;
};

type QualifyResponse = {
  success: boolean;
  videos?: QualifyVideo[];
  error?: string;
};

const DISQUALIFICATION_OPTIONS = [
  'Wrong or invalid video content',
  'Poor video/audio quality',
  'Violates copyright rules',
  'Unprofessional or inappropriate content',
] as const;

export default function QualifyClient() {
  const [videos, setVideos] = useState<QualifyVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);
  const [expandedDisqualifyId, setExpandedDisqualifyId] = useState<string | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<Record<string, string[]>>({});
  const [otherReasons, setOtherReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadVideos() {
      try {
        const response = await fetch('/api/qualify');
        const data: QualifyResponse = await response.json();

        if (!response.ok || !data.success || !data.videos) {
          throw new Error(data.error || 'Failed to load videos');
        }

        setVideos(data.videos);
      } catch (err) {
        console.error(err);
        setError('Failed to load videos for qualification.');
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

  function toggleReason(videoId: string, reason: string) {
    setSelectedReasons((current) => {
      const existing = current[videoId] ?? [];
      const next = existing.includes(reason)
        ? existing.filter((item) => item !== reason)
        : [...existing, reason];

      return {
        ...current,
        [videoId]: next,
      };
    });
  }

  function openDisqualifyForm(videoId: string) {
    setError('');
    setExpandedDisqualifyId(videoId);
  }

  function cancelDisqualifyForm() {
    setError('');
    setExpandedDisqualifyId(null);
  }

  async function handleDecision(
    videoId: string,
    decision: 'qualified' | 'disqualified'
  ) {
    setActingId(videoId);
    setError('');

    try {
      const response = await fetch(`/api/qualify/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ decision }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update video status');
      }

      setVideos((current) => current.filter((video) => video.id !== videoId));
    } catch (err) {
      console.error(err);
      setError('Failed to update video status.');
    } finally {
      setActingId(null);
    }
  }

  async function handleDisqualifySubmit(videoId: string) {
    const reasons = selectedReasons[videoId] ?? [];
    const otherReason = (otherReasons[videoId] ?? '').trim();

    if (reasons.length === 0 && otherReason.length === 0) {
      setError('Please select at least one disqualification reason or enter an other reason.');
      return;
    }

    setActingId(videoId);
    setError('');

    try {
      const response = await fetch(`/api/qualify/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision: 'disqualified',
          reasons,
          otherReason,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update video status');
      }

      setVideos((current) => current.filter((video) => video.id !== videoId));
      setExpandedDisqualifyId(null);
      setSelectedReasons((current) => {
        const next = { ...current };
        delete next[videoId];
        return next;
      });
      setOtherReasons((current) => {
        const next = { ...current };
        delete next[videoId];
        return next;
      });
    } catch (err) {
      console.error(err);
      setError('Failed to update video status.');
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Qualify</h1>
      <p className="pb-3">
        Review each video and mark it as qualified or disqualified.
      </p>

      {loading && <p>Loading videos...</p>}

      {error && <p className="mb-4 text-red-600">{error}</p>}

      {!loading && !error && videos.length === 0 && (
        <div className="rounded-lg border bg-white p-6">
          <p>No videos are currently awaiting qualification.</p>
        </div>
      )}

      <div className="space-y-6">
        {videos.map((video) => {
          const isExpanded = expandedDisqualifyId === video.id;
          const isActing = actingId === video.id;
          const reasonsForVideo = selectedReasons[video.id] ?? [];
          const otherReasonForVideo = otherReasons[video.id] ?? '';

          return (
            <section key={video.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="mb-4">
                <p className="text-sm">
                  <strong>User Email:</strong> {video.email ?? 'Unavailable'}
                </p>
              </div>

              {video.videoUrl ? (
                <video
                  controls
                  preload="metadata"
                  className="mb-4 w-full rounded-lg border"
                  src={video.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <p className="mb-4 text-sm text-red-600">Video URL unavailable.</p>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleDecision(video.id, 'qualified')}
                  disabled={isActing}
                  className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {isActing ? 'Saving...' : 'Qualified'}
                </button>

                <button
                  type="button"
                  onClick={() => openDisqualifyForm(video.id)}
                  disabled={isActing}
                  className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Disqualified
                </button>
              </div>

              {isExpanded && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <h2 className="mb-3 text-base font-semibold text-red-800">
                    Select disqualification reason(s)
                  </h2>

                  <div className="space-y-3">
                    {DISQUALIFICATION_OPTIONS.map((reason) => (
                      <label key={reason} className="flex items-start gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={reasonsForVideo.includes(reason)}
                          onChange={() => toggleReason(video.id, reason)}
                          disabled={isActing}
                          className="mt-1"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Other reason
                    </label>
                    <input
                      type="text"
                      value={otherReasonForVideo}
                      onChange={(event) =>
                        setOtherReasons((current) => ({
                          ...current,
                          [video.id]: event.target.value,
                        }))
                      }
                      disabled={isActing}
                      placeholder="Enter another reason"
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleDisqualifySubmit(video.id)}
                      disabled={isActing}
                      className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {isActing ? 'Saving...' : 'Submit Disqualification'}
                    </button>

                    <button
                      type="button"
                      onClick={cancelDisqualifyForm}
                      disabled={isActing}
                      className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}