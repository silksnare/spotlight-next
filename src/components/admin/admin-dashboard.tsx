'use client';

import { useMemo, useState } from 'react';

import type { AdminDashboardData } from '@/lib/admin-dashboard';

type AdminDashboardProps = {
  data: AdminDashboardData;
};

type DashboardTab = 'overview' | 'regions' | 'trends' | 'qualification' | 'gallery';

const TAB_OPTIONS: Array<{ key: DashboardTab; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'regions', label: 'Area Stats' },
  { key: 'trends', label: 'Upload Trends' },
  { key: 'qualification', label: 'Qualification' },
  { key: 'gallery', label: 'Video Gallery' },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function QualificationBadge({ status }: { status: boolean | null }) {
  if (status === true) {
    return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">Qualified</span>;
  }

  if (status === false) {
    return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">Disqualified</span>;
  }

  return <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Pending</span>;
}

function ProcessingBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  if (normalized === 'completed') {
    return <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">Completed</span>;
  }

  if (normalized === 'failed') {
    return <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">Failed</span>;
  }

  return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{status}</span>;
}

function RegionLabel({ value }: { value: number | null | undefined }) {
  return <>{typeof value === 'number' ? `Area ${value}` : 'Unknown'}</>;
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [qualificationFilter, setQualificationFilter] = useState<'all' | 'qualified' | 'disqualified' | 'pending'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const regions = useMemo(() => {
    const set = new Set<string>();
    for (const item of data.videos) {
      const value = typeof item.homeArea === 'number' ? `${item.homeArea}` : 'Unknown';
      set.add(value);
    }

    return [...set].sort((a, b) => a.localeCompare(b));
  }, [data.videos]);

  const filteredVideos = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.videos
      .filter((video) => {
        if (!query) return true;

        const fullName = `${video.user.displayName} ${video.user.firstName} ${video.user.lastName}`.toLowerCase();
        return fullName.includes(query) || video.user.email.toLowerCase().includes(query);
      })
      .filter((video) => {
        if (regionFilter === 'all') return true;
        const label = typeof video.homeArea === 'number' ? `${video.homeArea}` : 'Unknown';
        return label === regionFilter;
      })
      .filter((video) => {
        if (qualificationFilter === 'all') return true;
        if (qualificationFilter === 'qualified') return video.isQualified === true;
        if (qualificationFilter === 'disqualified') return video.isQualified === false;
        return video.isQualified === null;
      })
      .sort((a, b) => {
        const tA = new Date(a.createdAt).getTime();
        const tB = new Date(b.createdAt).getTime();
        return sortOrder === 'newest' ? tB - tA : tA - tB;
      });
  }, [data.videos, qualificationFilter, regionFilter, search, sortOrder]);

  const topRegion = data.regionStats[0];
  const maxDailyUploads = Math.max(...data.dailyUploadStats.map((item) => item.uploads), 1);

  return (
    <div className="page-container pt-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title">Client Reporting Dashboard</h1>
        <a
          href="/api/admin/video-submissions/export"
          className="inline-flex items-center rounded-full bg-[#1d4383] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#163469]"
        >
          Download Video Submissions CSV
        </a>
      </div>
      <p className="mb-6 text-sm text-slate-600">
        Snapshot of participation and qualification activity across program submissions.
      </p>

      <div className="mb-8 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
        {/*<span className="font-medium text-slate-700">Last updated: {formatDate(data.lastUpdated)}</span>*/}
        {data.activePhase && (
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
            Active phase: {data.activePhase.label}
          </span>
        )}
        {!data.activePhase && (
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
            No active phase configured
          </span>
        )}
      </div>

      <div className="mb-8 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? 'bg-[#1d4383] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['Total Submissions', data.overview.totalSubmissions],
              ['Total Qualified', data.overview.totalQualified],
              ['Total Disqualified', data.overview.totalDisqualified],
              ['Pending Qualification', data.overview.pendingQualification],
              ['Areas Represented', data.overview.distinctRegions],
              ['Uploads Today', data.overview.uploadsToday],
              ['Uploads Last 7 Days', data.overview.uploadsLast7Days],
              ['Processing Completed', data.overview.processingCompleted],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Summary Insights</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
              <li>Qualification rate is currently {formatPercent(data.overview.qualificationRate)} across all submissions.</li>
              <li>{topRegion ? `${topRegion.region} currently leads participation with ${topRegion.total} uploads.` : 'No regional data available yet.'}</li>
              <li>{data.overview.pendingQualification} submission(s) are still awaiting qualification decisions.</li>
            </ul>
          </div>
        </section>
      )}

      {activeTab === 'regions' && (
        <section className="space-y-6">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-3">Area</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Qualified</th>
                  <th className="px-4 py-3">Disqualified</th>
                  <th className="px-4 py-3">Pending</th>
                  <th className="px-4 py-3">Qualification Rate</th>
                  <th className="px-4 py-3">Share of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.regionStats.map((region) => (
                  <tr key={region.region}>
                    <td className="px-4 py-3 font-medium text-slate-900">{region.region}</td>
                    <td className="px-4 py-3">{region.total}</td>
                    <td className="px-4 py-3">{region.qualified}</td>
                    <td className="px-4 py-3">{region.disqualified}</td>
                    <td className="px-4 py-3">{region.pending}</td>
                    <td className="px-4 py-3">{formatPercent(region.qualificationRate)}</td>
                    <td className="px-4 py-3">{formatPercent(region.shareOfTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'trends' && (
        <section className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Uploads in the Last 30 Days</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5 lg:grid-cols-10">
            {data.dailyUploadStats.map((day) => {
              const height = Math.max((day.uploads / maxDailyUploads) * 140, day.uploads > 0 ? 8 : 4);
              return (
                <div key={day.date} className="flex flex-col items-center gap-2 rounded border border-slate-100 p-2">
                  <div className="text-[11px] text-slate-500">
                    {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex h-36 items-end">
                    <div className="w-6 rounded-t bg-[#1d4383]" style={{ height }} title={`${day.uploads} uploads`} />
                  </div>
                  <div className="text-xs font-semibold text-slate-700">{day.uploads}</div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-slate-600">Bar height represents daily upload volume. Counts include all qualification states.</p>
        </section>
      )}

      {activeTab === 'qualification' && (
        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs uppercase tracking-wide text-amber-700">Pending Queue</p>
              <p className="mt-2 text-3xl font-semibold text-amber-900">{data.overview.pendingQualification}</p>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-xs uppercase tracking-wide text-green-700">Qualified</p>
              <p className="mt-2 text-3xl font-semibold text-green-900">{data.overview.totalQualified}</p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-xs uppercase tracking-wide text-rose-700">Disqualified</p>
              <p className="mt-2 text-3xl font-semibold text-rose-900">{data.overview.totalDisqualified}</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-xs uppercase tracking-wide text-blue-700">Qualification Rate</p>
              <p className="mt-2 text-3xl font-semibold text-blue-900">{formatPercent(data.overview.qualificationRate)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Qualification by Area</h2>
            <div className="space-y-3">
              {data.regionStats.map((region) => (
                <div key={region.region}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{region.region}</span>
                    <span className="text-slate-500">{formatPercent(region.qualificationRate)} qualified</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded bg-slate-100">
                    <div className="h-full rounded bg-[#1d4383]" style={{ width: `${Math.max(region.qualificationRate, 2)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'gallery' && (
        <section className="space-y-4">
          <div className="sticky top-0 z-10 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />

              <select
                value={regionFilter}
                onChange={(event) => setRegionFilter(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="all">All areas</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>

              <select
                value={qualificationFilter}
                onChange={(event) => setQualificationFilter(event.target.value as typeof qualificationFilter)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="all">All qualification states</option>
                <option value="qualified">Qualified</option>
                <option value="disqualified">Disqualified</option>
                <option value="pending">Pending</option>
              </select>

              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as typeof sortOrder)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          {filteredVideos.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
              No submissions match the current filters.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredVideos.map((video) => (
              <article key={video.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="aspect-video bg-black">
                  {video.videoUrl ? (
                    <video src={video.videoUrl} controls className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      Video unavailable
                    </div>
                  )}
                </div>

                <div className="space-y-2 p-4 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-semibold text-slate-900">
                      {video.user.displayName || `${video.user.firstName} ${video.user.lastName}`}
                    </h3>
                    <QualificationBadge status={video.isQualified} />
                  </div>
                  <p className="truncate text-slate-600">{video.user.email}</p>
                  <p className="text-xs text-slate-500">Uploaded: {formatDate(video.createdAt)}</p>
                  <p className="text-xs text-slate-500">File: {video.originalFileName}</p>
                  <p className="text-xs text-slate-500">
                    <RegionLabel value={video.homeArea} />
                  </p>
                  <div className="pt-1">
                    <ProcessingBadge status={video.processingStatus} />
                  </div>

                  {video.isQualified === false && (  
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs">
                      <p className="mb-1 font-semibold text-red-800">Disqualification Details</p>

                      {video.disqualificationReasons?.length > 0 && (
                        <ul className="mb-1 list-disc pl-4 text-red-700">
                          {video.disqualificationReasons.map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                      )}

                      {video.disqualificationOther && (
                        <p className="text-red-700">
                          <span className="font-medium">Other:</span> {video.disqualificationOther}
                        </p>
                      )}

                      {video.disqualifiedBy && (
                        <p className="mt-1 text-[11px] text-red-600">
                          By: {video.disqualifiedBy}
                        </p>
                      )}

                      {video.disqualifiedAt && (
                        <p className="text-[11px] text-red-600">
                          On: {formatDate(video.disqualifiedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
