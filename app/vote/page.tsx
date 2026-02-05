'use client'

import { useState } from 'react'
import Link from 'next/link'
import Footer from '@/components/Footer'

interface VideoEntry {
  id: number
  title: string
  thumbnailUrl: string
}

// Generate 10 video entries
const videoEntries: VideoEntry[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: `Video ${String(i + 1).padStart(3, '0')}`,
  thumbnailUrl: `https://picsum.photos/seed/vote${i + 1}/400/300`,
}))

// Video Card Component
function VideoCard({
  video,
  isSelected,
  isWatched,
  onSelect,
  onWatch,
}: {
  video: VideoEntry
  isSelected: boolean
  isWatched: boolean
  onSelect: () => void
  onWatch: () => void
}) {
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayClick = () => {
    setIsPlaying(true)
    onWatch()
    // Simulate video ending after 3 seconds for demo
    setTimeout(() => setIsPlaying(false), 3000)
  }

  return (
    <div
      className={`border-2 rounded-lg overflow-hidden transition-all ${
        isSelected
          ? 'border-red-500 shadow-lg ring-2 ring-red-200'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Video Header */}
      <div className="flex justify-between items-center px-3 py-2 bg-white">
        <span className="text-sm font-medium text-gray-700">{video.title}</span>
        {isWatched && (
          <span className="text-xs text-gray-500">Watched</span>
        )}
      </div>

      {/* Video Thumbnail */}
      <div className="relative aspect-video bg-gray-100">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover"
        />

        {/* Play Button Overlay */}
        {!isPlaying && (
          <button
            onClick={handlePlayClick}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
          >
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}

        {/* Playing indicator */}
        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <svg className="w-12 h-12 mx-auto animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-sm">Playing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Vote Button */}
      <div className="p-3 bg-white">
        <button
          onClick={onSelect}
          className={`w-full py-2 px-4 rounded border-2 font-semibold uppercase tracking-wide text-sm transition-all ${
            isSelected
              ? 'bg-red-600 border-red-600 text-white'
              : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
          }`}
        >
          {isSelected ? '✓ Selected' : 'Vote'}
        </button>
      </div>
    </div>
  )
}

export default function VotePage() {
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null)
  const [watchedVideos, setWatchedVideos] = useState<Set<number>>(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const handleSelect = (videoId: number) => {
    setSelectedVideoId(videoId === selectedVideoId ? null : videoId)
  }

  const handleWatch = (videoId: number) => {
    setWatchedVideos((prev) => new Set([...prev, videoId]))
  }

  const handleSubmitVote = () => {
    if (selectedVideoId) {
      setHasSubmitted(true)
      alert(`Vote submitted for Video ${String(selectedVideoId).padStart(3, '0')}!`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Custom Header for Vote page */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-light tracking-wide">
                <span className="text-gray-800">sp</span>
                <span className="relative inline-block">
                  <span className="text-yellow-400">o</span>
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                </span>
                <span className="text-gray-800">tlight</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/#awards" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Awards</Link>
              <span className="text-gray-300">|</span>
              <Link href="/#details" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Details</Link>
              <span className="text-gray-300">|</span>
              <Link href="/#demo" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Demo</Link>
              <span className="text-gray-300">|</span>
              <Link href="/#overview" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Overview</Link>
              <span className="text-gray-300">|</span>
              <Link href="/#resources" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Resources</Link>
            </nav>

            {/* Vote Button (highlighted as current page) */}
            <div className="hidden md:block">
              <span className="bg-red-600 text-white text-sm font-semibold py-2 px-6 rounded uppercase tracking-wide inline-block">
                Vote
              </span>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col space-y-3">
                <Link href="/#awards" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Awards</Link>
                <Link href="/#details" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Details</Link>
                <Link href="/#demo" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Demo</Link>
                <Link href="/#overview" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Overview</Link>
                <Link href="/#resources" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Resources</Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Peer Voting
          </span>
        </h1>

        {/* Welcome Section */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide mb-3">
            Welcome to Peer Voting!
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-4xl">
            Olor as rest que sapicimolut velis expercieexperc iet, su met andmolut velis experciet, smet andel ium seni ditisquae repe ventas rest que sapicio lut
            velis experciet, sumet andmo lut velis experciet, sumet andel iu expercieexperc iet, su met andmolut velis experciet, smet andel ium seni ditis quae
            repe ventas rest que sapiciolut velis experciet, sumet andmo lut velis experciet, sumet andel ium seni ditisquae repe vent expercie awe perc iet, su
            met andmolut velis experciet, smet andel ium seni ditisqo lut velis experciet, sumet andel ium seni ditisquae reae repe vent.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {videoEntries.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              isSelected={selectedVideoId === video.id}
              isWatched={watchedVideos.has(video.id)}
              onSelect={() => handleSelect(video.id)}
              onWatch={() => handleWatch(video.id)}
            />
          ))}
        </div>

        {/* Submit Button */}
        {selectedVideoId && !hasSubmitted && (
          <div className="flex justify-center">
            <button
              onClick={handleSubmitVote}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold py-4 px-12 rounded-lg uppercase tracking-wider text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Submit Vote
            </button>
          </div>
        )}

        {/* Confirmation Message */}
        {hasSubmitted && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thank you for voting!</h3>
            <p className="text-gray-600">Your vote has been submitted successfully.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
