'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface VideoSubmission {
  id: number
  thumbnailUrl: string
  videoUrl: string
  uploadedBy: string
  region: string
}

interface SectionScore {
  [key: string]: number
}

interface VideoScores {
  [videoId: number]: SectionScore
}

// Scoring criteria sections
const scoringCriteria = [
  {
    id: 'section1',
    title: 'Section 1',
    description: 'Lom owneoi maisdo nfwieom aosdn foiwen ioansd fioa weio nasdsdo nfwieom aosdn foiwen ioansd fioa weio na. Nomw wesdsdo nfwieom aoswea sdifnoi aew nfdvf.',
    maxScore: 20,
  },
  {
    id: 'section2',
    title: 'Section 2',
    description: 'Lom owneoi maisdo nfwieom aosdn foiwen ioansd fioa weio weio na. Nomw wesdsdo nfwieom aosdn foiwen ioansd fioa weio nas do ifnaio wefnoa sdifnoi aew nfdvf.',
    maxScore: 20,
  },
  {
    id: 'section3',
    title: 'Section 3',
    description: 'Lom owneoi maisdo nfwieom aosdn foiwen ioaned fioa weio nasdsdo nfwieom aosdn foiwen ioansd fioa weio na. Nomw wesdsdo nfwieom aosdn foiwen ioew nfdvf.',
    maxScore: 20,
  },
]

const maxTotalScore = scoringCriteria.reduce((sum, section) => sum + section.maxScore, 0)

// Mock video submissions data
const videoSubmissions: VideoSubmission[] = [
  {
    id: 1,
    thumbnailUrl: 'https://picsum.photos/seed/video1/640/360',
    videoUrl: '',
    uploadedBy: 'RC@gmail.com',
    region: 'Los Angeles',
  },
  {
    id: 2,
    thumbnailUrl: 'https://picsum.photos/seed/video2/640/360',
    videoUrl: '',
    uploadedBy: 'JD@company.com',
    region: 'New York',
  },
  {
    id: 3,
    thumbnailUrl: 'https://picsum.photos/seed/video3/640/360',
    videoUrl: '',
    uploadedBy: 'SM@email.com',
    region: 'Chicago',
  },
]

// Score Slider Component
function ScoreSlider({
  value,
  maxScore,
  onChange,
}: {
  value: number
  maxScore: number
  onChange: (value: number) => void
}) {
  const percentage = (value / maxScore) * 100

  return (
    <div className="w-full">
      <div className="relative pt-6 pb-2">
        {/* Score bubble */}
        <div
          className="absolute -top-1 transform -translate-x-1/2 transition-all duration-150"
          style={{ left: `${percentage}%` }}
        >
          <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded min-w-[40px] text-center">
            {value.toFixed(value % 1 === 0 ? 0 : 2)}
          </div>
        </div>

        {/* Slider track */}
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div
            className="absolute h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full transition-all duration-150"
            style={{ width: `${percentage}%` }}
          />
          {/* Slider thumb */}
          <input
            type="range"
            min="0"
            max={maxScore}
            step="0.25"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-orange-500 rounded-full shadow-md pointer-events-none transition-all duration-150"
            style={{ left: `calc(${percentage}% - 8px)` }}
          />
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Unsatisfactory</span>
          <span>Outstanding</span>
        </div>
      </div>
    </div>
  )
}

// Video Scorecard Component
function VideoScorecard({
  video,
  scores,
  onScoreChange,
  onSubmit,
  judgeInfo,
}: {
  video: VideoSubmission
  scores: SectionScore
  onScoreChange: (sectionId: string, value: number) => void
  onSubmit: () => void
  judgeInfo: { name: string; region: string }
}) {
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
  const hasScores = Object.values(scores).some(score => score > 0)

  return (
    <div className="border-b border-gray-200 pb-12 mb-12 last:border-b-0 last:pb-0 last:mb-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Video Player */}
        <div>
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg">
            <img
              src={video.thumbnailUrl}
              alt={`Video by ${video.uploadedBy}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Uploaded By: <span className="font-semibold text-gray-900">{video.uploadedBy}</span>
            <span className="mx-2">|</span>
            Region/PD: <span className="font-semibold text-gray-900">{video.region}</span>
          </div>
        </div>

        {/* Scoring Panel */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Judging Criteria</h3>
          <div className="text-sm text-gray-600 mb-6 flex flex-wrap gap-x-2">
            <span>Max Score <span className="font-semibold text-gray-900">{maxTotalScore}.0</span></span>
            <span>|</span>
            <span>Region/PD Name: <span className="font-semibold text-gray-900">{judgeInfo.name}</span></span>
            <span>|</span>
            <span>Final Score: <span className="font-semibold text-gray-900">{hasScores ? totalScore.toFixed(2) : '----'}</span></span>
          </div>

          {/* Scoring Sections */}
          <div className="space-y-6">
            {scoringCriteria.map((section) => (
              <div key={section.id} className="grid grid-cols-1 md:grid-cols-[1fr,180px] gap-4 items-start">
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{section.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed mb-1">
                    {section.description}
                  </p>
                  <p className="text-xs text-gray-500">Max Score: {section.maxScore}</p>
                </div>
                <div className="md:pt-2">
                  <ScoreSlider
                    value={scores[section.id] || 0}
                    maxScore={section.maxScore}
                    onChange={(value) => onScoreChange(section.id, value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={onSubmit}
              disabled={!hasScores}
              className={`px-12 py-4 rounded-lg text-white font-semibold uppercase tracking-wider text-lg transition-all ${
                hasScores
                  ? 'bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 shadow-lg hover:shadow-xl cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function JudgePage() {
  const [videoScores, setVideoScores] = useState<VideoScores>(() => {
    const initialScores: VideoScores = {}
    videoSubmissions.forEach((video) => {
      initialScores[video.id] = {}
      scoringCriteria.forEach((section) => {
        initialScores[video.id][section.id] = 0
      })
    })
    return initialScores
  })

  const judgeInfo = {
    name: 'Judge 2',
    region: 'West Coast',
  }

  const handleScoreChange = (videoId: number, sectionId: string, value: number) => {
    setVideoScores((prev) => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        [sectionId]: value,
      },
    }))
  }

  const handleSubmit = (videoId: number) => {
    const scores = videoScores[videoId]
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
    alert(`Scores submitted for video ${videoId}!\nTotal Score: ${totalScore.toFixed(2)}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Judge's Panel
          </span>
        </h1>

        {/* Videos Count */}
        <p className="text-sm uppercase tracking-wide text-gray-700 mb-8">
          Videos to be judged: <span className="font-bold">{videoSubmissions.length}</span>
        </p>

        {/* Video List with Scorecards */}
        <div className="space-y-12">
          {videoSubmissions.map((video) => (
            <VideoScorecard
              key={video.id}
              video={video}
              scores={videoScores[video.id]}
              onScoreChange={(sectionId, value) => handleScoreChange(video.id, sectionId, value)}
              onSubmit={() => handleSubmit(video.id)}
              judgeInfo={judgeInfo}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
