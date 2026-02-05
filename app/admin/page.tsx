'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Types
type TabType = 'participation' | 'leaderboard' | 'videos' | 'reports'

// Mock data
const dailyUploads = [12, 18, 25, 15, 32, 28, 45, 38, 52, 48, 55, 42, 58, 65, 48, 72, 68, 75, 62, 78]
const zoneData = [
  { name: 'Zone 1', uploads: 142, color: 'bg-blue-500' },
  { name: 'Zone 2', uploads: 259, color: 'bg-emerald-500' },
  { name: 'Zone 3', uploads: 108, color: 'bg-purple-500' },
  { name: 'Zone 4', uploads: 128, color: 'bg-amber-500' },
]

const leaderboardData = {
  zone1: [
    { ranking: 1, region: 4, videoNumber: 36, submittedBy: 'Tom Sample', dealership: 'Meadowbrook Toyota' },
    { ranking: 2, region: 7, videoNumber: 72, submittedBy: 'Pat Example', dealership: 'Ironwood Toyota' },
    { ranking: 3, region: 2, videoNumber: 11, submittedBy: 'Chris Placeholder', dealership: 'Golden Plains Toyota' },
  ],
  zone2: [
    { ranking: 1, region: 14, videoNumber: 18, submittedBy: 'Jordan Fictus', dealership: 'Summit Toyota' },
    { ranking: 2, region: 11, videoNumber: 165, submittedBy: 'Taylor McAlias', dealership: 'Cedar Valley Toyota' },
    { ranking: 3, region: 17, videoNumber: 48, submittedBy: 'Morgan Blankenship', dealership: 'Riverbend Toyota' },
  ],
  zone3: [
    { ranking: 1, region: 31, videoNumber: 92, submittedBy: 'Riley Pseudonym', dealership: 'Grand Mesa Toyota' },
    { ranking: 2, region: 22, videoNumber: 38, submittedBy: 'Blake Placeholder', dealership: 'Lakeside Toyota' },
    { ranking: 3, region: 19, videoNumber: 78, submittedBy: 'Cameron Default', dealership: 'Sierra Heights Toyota' },
  ],
  zone4: [
    { ranking: 1, region: 36, videoNumber: 77, submittedBy: 'Sam Sampleton', dealership: 'Silver Ridge Toyota' },
    { ranking: 2, region: 42, videoNumber: 159, submittedBy: 'Logan Nonymous', dealership: 'Oakwood Toyota' },
    { ranking: 3, region: 34, videoNumber: 31, submittedBy: 'Dana Mockname', dealership: 'Pinecrest Toyota' },
  ],
}

const uploadedVideos = [
  { videoNumber: 1, zone: 4, email: 'TomSample@MeadowToyota.com', status: 'Qualified' },
  { videoNumber: 2, zone: 1, email: 'DarrenPlaceholder@CapitolToyota.com', status: 'Qualified' },
  { videoNumber: 3, zone: 1, email: 'ChrisPlaceholder@GoldenPlainsToyota.com', status: 'Qualified' },
  { videoNumber: 4, zone: 3, email: 'JordanFictus@SummitToyota.com', status: 'Qualified' },
  { videoNumber: 5, zone: 3, email: 'TaylorMcAlias@CedarValleyToyota.com', status: 'Needs Qualification' },
  { videoNumber: 6, zone: 2, email: 'MorganBlankenship@RiverbendToyota.com', status: 'Qualified' },
  { videoNumber: 7, zone: 4, email: 'RileyPseudonym@GrandMesaToyota.com', status: 'Needs Qualification' },
  { videoNumber: 8, zone: 3, email: 'BlakePlaceholder@LakesideToyota.com', status: 'Qualified' },
  { videoNumber: 9, zone: 1, email: 'CameronDefault@SierraHeightsToyota.com', status: 'Needs Qualification' },
  { videoNumber: 10, zone: 2, email: 'SamSampleton@SilverRidgeToyota.com', status: 'Qualified' },
  { videoNumber: 11, zone: 1, email: 'LoganNonymous@OakwoodToyota.com', status: 'Qualified' },
  { videoNumber: 12, zone: 4, email: 'DanaMockname@PinecrestToyota.com', status: 'Qualified' },
  { videoNumber: 13, zone: 4, email: 'BlakePlaceholder@LakesideToyota.com', status: 'Qualified' },
  { videoNumber: 14, zone: 1, email: 'CameronDefault@SierraHeightsToyota.com', status: 'Needs Qualification' },
  { videoNumber: 15, zone: 2, email: 'SamSampleton@SilverRidgeToyota.com', status: 'Qualified' },
  { videoNumber: 16, zone: 1, email: 'LoganNonymous@OakwoodToyota.com', status: 'Qualified' },
  { videoNumber: 17, zone: 2, email: 'DanaMockname@PinecrestToyota.com', status: 'Qualified' },
  { videoNumber: 18, zone: 2, email: 'SamSampleton@SilverRidgeToyota.com', status: 'Qualified' },
  { videoNumber: 19, zone: 3, email: 'TrishAnonymous@WoodCrestToyota.com', status: 'Qualified' },
  { videoNumber: 20, zone: 4, email: 'DanaMockname@PinecrestToyota.com', status: 'Qualified' },
]

// Animated Bar Chart Component
function BarChart({ data, maxValue }: { data: number[]; maxValue: number }) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex items-end justify-between h-32 gap-1">
      {data.map((value, index) => (
        <div
          key={index}
          className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t transition-all duration-1000 ease-out"
          style={{
            height: animated ? `${(value / maxValue) * 100}%` : '0%',
            transitionDelay: `${index * 50}ms`,
          }}
        />
      ))}
    </div>
  )
}

// Animated Horizontal Bar Chart
function HorizontalBarChart({ zones }: { zones: typeof zoneData }) {
  const [animated, setAnimated] = useState(false)
  const maxUploads = Math.max(...zones.map((z) => z.uploads))

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-3">
      {zones.map((zone, index) => (
        <div key={zone.name} className="flex items-center gap-3">
          <span className="text-sm text-gray-600 w-16">{zone.name.toUpperCase()}</span>
          <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
            <div
              className={`h-full ${zone.color} rounded transition-all duration-1000 ease-out`}
              style={{
                width: animated ? `${(zone.uploads / maxUploads) * 100}%` : '0%',
                transitionDelay: `${index * 150}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Animated Donut Chart
function DonutChart({ judged, total }: { judged: number; total: number }) {
  const [animated, setAnimated] = useState(false)
  const percentage = (judged / total) * 100
  const circumference = 2 * Math.PI * 45

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#donutGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? circumference - (percentage / 100) * circumference : circumference}
          className="transition-all duration-1500 ease-out"
        />
        <defs>
          <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

// Stat Card Component
function StatCard({ label, value, color = 'text-orange-500' }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="text-center p-4 border border-gray-200 rounded-lg">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl md:text-4xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

// Section Header
function SectionHeader({ title, color = 'bg-orange-500' }: { title: string; color?: string }) {
  return (
    <div className={`${color} text-white text-center py-3 rounded-t-lg font-semibold uppercase tracking-wide`}>
      {title}
    </div>
  )
}

// Leaderboard Table
function LeaderboardTable({ data, zoneName }: { data: typeof leaderboardData.zone1; zoneName: string }) {
  return (
    <div className="mb-8">
      <h3 className="font-semibold text-gray-900 mb-3">{zoneName}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-medium text-gray-600">Ranking</th>
              <th className="text-left py-2 px-3 font-medium text-gray-600">Region</th>
              <th className="text-left py-2 px-3 font-medium text-gray-600">Video Number</th>
              <th className="text-left py-2 px-3 font-medium text-gray-600">Submitted by</th>
              <th className="text-left py-2 px-3 font-medium text-gray-600">Dealership</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.ranking} className="border-b border-gray-100">
                <td className="py-2 px-3 text-gray-700">{row.ranking}</td>
                <td className="py-2 px-3 text-gray-700">{row.region}</td>
                <td className="py-2 px-3">
                  <span className="text-orange-500 font-semibold cursor-pointer hover:underline">
                    {row.videoNumber}
                  </span>
                </td>
                <td className="py-2 px-3 text-gray-700">{row.submittedBy}</td>
                <td className="py-2 px-3 text-gray-700">{row.dealership}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('participation')

  const tabs = [
    { id: 'participation' as TabType, label: 'Zone Participation' },
    { id: 'leaderboard' as TabType, label: 'Zone Leaderboard' },
    { id: 'videos' as TabType, label: 'Uploaded Videos' },
    { id: 'reports' as TabType, label: 'Reports' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-10">
          <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Client's Panel
          </span>
        </h1>

        {/* Dashboard Title */}
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">Dashboard</h2>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center border-b border-gray-200 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Zone Participation Tab */}
          {activeTab === 'participation' && (
            <>
              {/* User Participation Overall */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <SectionHeader title="User Participation Overall" />
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
                    <div className="lg:col-span-1">
                      <BarChart data={dailyUploads} maxValue={Math.max(...dailyUploads)} />
                      <p className="text-center text-sm text-gray-500 mt-2">Daily Uploads</p>
                    </div>
                    <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatCard label="Total Uploaded" value={647} />
                      <StatCard label="Total Qualified" value={639} color="text-emerald-500" />
                      <StatCard label="Total Disqualified" value={8} color="text-red-500" />
                      <StatCard label="User Votes" value={713} color="text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploads by Zones */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <SectionHeader title="Uploads by Zones" color="bg-gradient-to-r from-emerald-500 to-teal-500" />
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <HorizontalBarChart zones={zoneData} />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatCard label="Zone 1" value={142} color="text-blue-500" />
                      <StatCard label="Zone 2" value={259} color="text-emerald-500" />
                      <StatCard label="Zone 3" value={108} color="text-purple-500" />
                      <StatCard label="Zone 4" value={128} color="text-amber-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Judging Progress Overall */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <SectionHeader title="Judging Progress Overall" color="bg-gradient-to-r from-amber-500 to-orange-500" />
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                    <div className="flex justify-center">
                      <DonutChart judged={621} total={647} />
                    </div>
                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                      <StatCard label="Videos Judged" value={621} color="text-emerald-500" />
                      <StatCard label="Videos to be Judged" value={26} color="text-amber-500" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Zone Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <SectionHeader title="Leaderboard by Zones" color="bg-gradient-to-r from-rose-500 to-orange-500" />
              <div className="p-6">
                <LeaderboardTable data={leaderboardData.zone1} zoneName="Zone 1" />
                <LeaderboardTable data={leaderboardData.zone2} zoneName="Zone 2" />
                <LeaderboardTable data={leaderboardData.zone3} zoneName="Zone 3" />
                <LeaderboardTable data={leaderboardData.zone4} zoneName="Zone 4" />
              </div>
            </div>
          )}

          {/* Uploaded Videos Tab */}
          {activeTab === 'videos' && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <SectionHeader title="Uploaded Videos" color="bg-gradient-to-r from-green-500 to-emerald-500" />
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-medium text-gray-600">Video Number</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600">Zone</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600">Email</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadedVideos.map((video) => (
                        <tr key={video.videoNumber} className="border-b border-gray-100">
                          <td className="py-2 px-3">
                            <span className="text-orange-500 font-semibold">{video.videoNumber}</span>
                          </td>
                          <td className="py-2 px-3 text-gray-700">{video.zone}</td>
                          <td className="py-2 px-3 text-blue-600">{video.email}</td>
                          <td className="py-2 px-3">
                            <span
                              className={
                                video.status === 'Qualified'
                                  ? 'text-gray-700'
                                  : 'text-amber-600'
                              }
                            >
                              {video.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="mt-4 text-orange-500 hover:text-orange-600 text-sm font-medium">
                  View Complete List
                </button>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <SectionHeader title="Reports" color="bg-gradient-to-r from-red-500 to-rose-500" />
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Participation Report */}
                  <div className="bg-amber-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Participation Report</h3>
                    <div className="space-y-3">
                      <a
                        href="#"
                        className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium">Download PDF file</span>
                      </a>
                      <a
                        href="#"
                        className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium">Download Excel Doc</span>
                      </a>
                    </div>
                  </div>

                  {/* User Logs */}
                  <div className="bg-amber-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Logs</h3>
                    <div className="space-y-3">
                      <a
                        href="#"
                        className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium">Download PDF file</span>
                      </a>
                      <a
                        href="#"
                        className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium">Download Excel Doc</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
