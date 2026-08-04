'use client'

import { useMemo, useState } from 'react'

import type { AdminDashboardData } from '@/lib/admin-dashboard'

type AdminDashboardProps = {
  data: AdminDashboardData
}

type DashboardTab =
  | 'overview'
  | 'regions'
  | 'trends'
  | 'qualification'
  | 'gallery'

const TAB_OPTIONS: Array<{ key: DashboardTab; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'regions', label: 'Region Stats' },
  { key: 'trends', label: 'Upload Trends' },
  { key: 'qualification', label: 'Qualification' },
  { key: 'gallery', label: 'Video Gallery' },
]

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function QualificationBadge({ status }: { status: boolean | null }) {
  if (status === true) {
    return (
      <span className="border border-[#231f24] bg-[#231f24] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white">
        Qualified
      </span>
    )
  }

  if (status === false) {
    return (
      <span className="border border-[#231f24] bg-white px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#231f24]">
        Disqualified
      </span>
    )
  }

  return (
    <span className="border border-[#9b9b9b] bg-[#f4f4f4] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#555555]">
      Pending
    </span>
  )
}

function ProcessingBadge({ status }: { status: string }) {
  return (
    <span className="border border-[#d6d6d6] bg-white px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#231f24]">
      {status}
    </span>
  )
}

function RegionLabel({ value }: { value: number | null | undefined }) {
  return <>{typeof value === 'number' ? `Region ${value}` : 'Unknown'}</>
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState('all')
  const [qualificationFilter, setQualificationFilter] = useState<
    'all' | 'qualified' | 'disqualified' | 'pending'
  >('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  const regions = useMemo(() => {
    const set = new Set<string>()

    for (const item of data.videos) {
      set.add(typeof item.homeArea === 'number' ? `${item.homeArea}` : 'Unknown')
    }

    return [...set].sort((a, b) => a.localeCompare(b))
  }, [data.videos])

  const filteredVideos = useMemo(() => {
    const query = search.trim().toLowerCase()

    return data.videos
      .filter((video) => {
        if (!query) return true

        const fullName =
          `${video.user.displayName} ${video.user.firstName} ${video.user.lastName}`.toLowerCase()

        return (
          fullName.includes(query) ||
          video.user.email.toLowerCase().includes(query)
        )
      })
      .filter((video) => {
        if (regionFilter === 'all') return true

        const label =
          typeof video.homeArea === 'number' ? `${video.homeArea}` : 'Unknown'

        return label === regionFilter
      })
      .filter((video) => {
        if (qualificationFilter === 'all') return true
        if (qualificationFilter === 'qualified') return video.isQualified === true
        if (qualificationFilter === 'disqualified') return video.isQualified === false
        return video.isQualified === null
      })
      .sort((a, b) => {
        const tA = new Date(a.createdAt).getTime()
        const tB = new Date(b.createdAt).getTime()

        return sortOrder === 'newest' ? tB - tA : tA - tB
      })
  }, [data.videos, qualificationFilter, regionFilter, search, sortOrder])

  const topRegion = data.regionStats[0]
  const maxDailyUploads = Math.max(
    ...data.dailyUploadStats.map((item) => item.uploads),
    1,
  )

  return (
    <div className="bg-[#f4f4f4]">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-[family:var(--font-cadillac)] text-[12px] font-bold uppercase tracking-[0.45em] text-[#231f24]">
              Client Reporting
            </p>

            <h1 className="mt-3 font-[family:var(--font-cadillac)] text-[30px] font-bold uppercase tracking-[0.18em] text-[#231f24] sm:text-[42px]">
              Dashboard
            </h1>

            <p className="mt-6 max-w-[760px] text-[15px] leading-7 text-[#111111]">
              Snapshot of participation, qualification activity and submission
              progress across the Choose Your EV Conquest program.
            </p>
          </div>

          <a
            href="/api/admin/video-submissions/export"
            className="inline-flex h-[50px] items-center justify-center bg-[#231f24] px-6 font-[family:var(--font-cadillac)] text-[12px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black"
          >
            Download CSV
          </a>
        </div>

        <div className="mb-8 border border-[#d6d6d6] bg-white px-5 py-4">
          {data.activePhase ? (
            <span className="font-[family:var(--font-cadillac)] text-[12px] font-bold uppercase tracking-[0.2em] text-[#231f24]">
              Active Phase: {data.activePhase.label}
            </span>
          ) : (
            <span className="font-[family:var(--font-cadillac)] text-[12px] font-bold uppercase tracking-[0.2em] text-[#555555]">
              No Active Phase Configured
            </span>
          )}
        </div>

        <div className="mb-8 flex flex-wrap gap-3 border-b border-[#d6d6d6] pb-5">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 font-[family:var(--font-cadillac)] text-[12px] font-bold uppercase tracking-[0.16em] transition ${
                activeTab === tab.key
                  ? 'bg-[#231f24] text-white'
                  : 'border border-[#d6d6d6] bg-white text-[#231f24] hover:border-[#231f24]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' ? (
          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['Total Submissions', data.overview.totalSubmissions],
                ['Total Qualified', data.overview.totalQualified],
                ['Total Disqualified', data.overview.totalDisqualified],
                ['Pending Qualification', data.overview.pendingQualification],
                ['Regions Represented', data.overview.distinctRegions],
                ['Uploads Today', data.overview.uploadsToday],
                ['Uploads Last 7 Days', data.overview.uploadsLast7Days],
                ['Processing Completed', data.overview.processingCompleted],
              ].map(([label, value]) => (
                <div key={label} className="border border-[#d6d6d6] bg-white p-5">
                  <p className="font-[family:var(--font-cadillac)] text-[11px] font-bold uppercase tracking-[0.22em] text-[#555555]">
                    {label}
                  </p>

                  <p className="mt-4 text-[34px] font-bold leading-none text-[#231f24]">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="border border-[#d6d6d6] bg-white p-6">
              <h2 className="font-[family:var(--font-cadillac)] text-[22px] font-bold uppercase tracking-[0.14em] text-[#231f24]">
                Summary Insights
              </h2>

              <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-[#111111]">
                <li>
                  Qualification rate is currently{' '}
                  {formatPercent(data.overview.qualificationRate)} across all
                  submissions.
                </li>
                <li>
                  {topRegion
                    ? `${topRegion.region} currently leads participation with ${topRegion.total} uploads.`
                    : 'No regional data available yet.'}
                </li>
                <li>
                  {data.overview.pendingQualification} submission(s) are still
                  awaiting qualification decisions.
                </li>
              </ul>
            </div>
          </section>
        ) : null}

        {activeTab === 'regions' ? (
          <section className="overflow-x-auto border border-[#d6d6d6] bg-white">
            <table className="min-w-full text-sm">
              <thead className="border-b border-[#d6d6d6] bg-[#231f24] text-left font-[family:var(--font-cadillac)] text-[11px] uppercase tracking-[0.18em] text-white">
                <tr>
                  <th className="px-4 py-4">Region</th>
                  <th className="px-4 py-4">Total</th>
                  <th className="px-4 py-4">Qualified</th>
                  <th className="px-4 py-4">Disqualified</th>
                  <th className="px-4 py-4">Pending</th>
                  <th className="px-4 py-4">Qualification Rate</th>
                  <th className="px-4 py-4">Share of Total</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#d6d6d6] bg-white">
                {data.regionStats.map((region) => (
                  <tr key={region.region}>
                    <td className="px-4 py-4 font-bold text-[#231f24]">
                      {region.region}
                    </td>
                    <td className="px-4 py-4">{region.total}</td>
                    <td className="px-4 py-4">{region.qualified}</td>
                    <td className="px-4 py-4">{region.disqualified}</td>
                    <td className="px-4 py-4">{region.pending}</td>
                    <td className="px-4 py-4">
                      {formatPercent(region.qualificationRate)}
                    </td>
                    <td className="px-4 py-4">
                      {formatPercent(region.shareOfTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {activeTab === 'trends' ? (
          <section className="border border-[#d6d6d6] bg-white p-6">
            <h2 className="font-[family:var(--font-cadillac)] text-[22px] font-bold uppercase tracking-[0.14em] text-[#231f24]">
              Uploads in the Last 30 Days
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-5 lg:grid-cols-10">
              {data.dailyUploadStats.map((day) => {
                const height = Math.max(
                  (day.uploads / maxDailyUploads) * 140,
                  day.uploads > 0 ? 8 : 4,
                )

                return (
                  <div
                    key={day.date}
                    className="flex flex-col items-center gap-2 border border-[#d6d6d6] p-2"
                  >
                    <div className="text-[11px] text-[#555555]">
                      {new Date(day.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>

                    <div className="flex h-36 items-end">
                      <div
                        className="w-6 bg-[#231f24]"
                        style={{ height }}
                        title={`${day.uploads} uploads`}
                      />
                    </div>

                    <div className="text-xs font-bold text-[#231f24]">
                      {day.uploads}
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="mt-5 text-[14px] leading-6 text-[#555555]">
              Bar height represents daily upload volume. Counts include all
              qualification states.
            </p>
          </section>
        ) : null}

        {activeTab === 'qualification' ? (
          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                ['Pending Queue', data.overview.pendingQualification],
                ['Qualified', data.overview.totalQualified],
                ['Disqualified', data.overview.totalDisqualified],
                ['Qualification Rate', formatPercent(data.overview.qualificationRate)],
              ].map(([label, value]) => (
                <div key={label} className="border border-[#d6d6d6] bg-white p-5">
                  <p className="font-[family:var(--font-cadillac)] text-[11px] font-bold uppercase tracking-[0.22em] text-[#555555]">
                    {label}
                  </p>

                  <p className="mt-4 text-[34px] font-bold leading-none text-[#231f24]">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="border border-[#d6d6d6] bg-white p-6">
              <h2 className="font-[family:var(--font-cadillac)] text-[22px] font-bold uppercase tracking-[0.14em] text-[#231f24]">
                Qualification by Region
              </h2>

              <div className="mt-5 space-y-4">
                {data.regionStats.map((region) => (
                  <div key={region.region}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-bold text-[#231f24]">
                        {region.region}
                      </span>
                      <span className="text-[#555555]">
                        {formatPercent(region.qualificationRate)} qualified
                      </span>
                    </div>

                    <div className="h-2 bg-[#d6d6d6]">
                      <div
                        className="h-full bg-[#231f24]"
                        style={{
                          width: `${Math.max(region.qualificationRate, 2)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === 'gallery' ? (
          <section className="space-y-5">
            <div className="sticky top-[100px] z-10 border border-[#d6d6d6] bg-white p-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name or email"
                  className="border border-[#d6d6d6] px-3 py-2 text-sm outline-none focus:border-[#231f24]"
                />

                <select
                  value={regionFilter}
                  onChange={(event) => setRegionFilter(event.target.value)}
                  className="border border-[#d6d6d6] px-3 py-2 text-sm outline-none focus:border-[#231f24]"
                >
                  <option value="all">All regions</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>

                <select
                  value={qualificationFilter}
                  onChange={(event) =>
                    setQualificationFilter(
                      event.target.value as typeof qualificationFilter,
                    )
                  }
                  className="border border-[#d6d6d6] px-3 py-2 text-sm outline-none focus:border-[#231f24]"
                >
                  <option value="all">All qualification states</option>
                  <option value="qualified">Qualified</option>
                  <option value="disqualified">Disqualified</option>
                  <option value="pending">Pending</option>
                </select>

                <select
                  value={sortOrder}
                  onChange={(event) =>
                    setSortOrder(event.target.value as typeof sortOrder)
                  }
                  className="border border-[#d6d6d6] px-3 py-2 text-sm outline-none focus:border-[#231f24]"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>

            {filteredVideos.length === 0 ? (
              <div className="border border-[#d6d6d6] bg-white p-6 text-sm text-[#555555]">
                No submissions match the current filters.
              </div>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredVideos.map((video) => (
                <article key={video.id} className="border border-[#d6d6d6] bg-white">
                  <div className="aspect-video bg-black">
                    {video.videoUrl ? (
                      <video
                        src={video.videoUrl}
                        controls
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-white/60">
                        Video unavailable
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-4 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate font-bold text-[#231f24]">
                        {video.user.displayName ||
                          `${video.user.firstName} ${video.user.lastName}`}
                      </h3>

                      <QualificationBadge status={video.isQualified} />
                    </div>

                    <p className="truncate text-[#555555]">{video.user.email}</p>
                    <p className="text-xs text-[#555555]">
                      Uploaded: {formatDate(video.createdAt)}
                    </p>
                    <p className="text-xs text-[#555555]">
                      File: {video.originalFileName}
                    </p>
                    <p className="text-xs text-[#555555]">
                      <RegionLabel value={video.homeArea} />
                    </p>

                    <ProcessingBadge status={video.processingStatus} />

                    {video.isQualified === false ? (
                      <div className="mt-3 border border-[#d6d6d6] bg-[#f4f4f4] p-3 text-xs">
                        <p className="mb-1 font-bold text-[#231f24]">
                          Disqualification Details
                        </p>

                        {video.disqualificationReasons?.length > 0 ? (
                          <ul className="mb-1 list-disc pl-4 text-[#111111]">
                            {video.disqualificationReasons.map((reason) => (
                              <li key={reason}>{reason}</li>
                            ))}
                          </ul>
                        ) : null}

                        {video.disqualificationOther ? (
                          <p className="text-[#111111]">
                            <span className="font-bold">Other:</span>{' '}
                            {video.disqualificationOther}
                          </p>
                        ) : null}

                        {video.disqualifiedBy ? (
                          <p className="mt-1 text-[11px] text-[#555555]">
                            By: {video.disqualifiedBy}
                          </p>
                        ) : null}

                        {video.disqualifiedAt ? (
                          <p className="text-[11px] text-[#555555]">
                            On: {formatDate(video.disqualifiedAt)}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}