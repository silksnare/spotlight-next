'use client'

import { useState, useEffect, useCallback } from 'react'

// Carousel Component
function Carousel({
  children,
  showArrows = true,
  className = '',
}: {
  children: React.ReactNode[]
  showArrows?: boolean
  className?: string
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const totalSlides = children.length

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  return (
    <div className={`relative ${className}`}>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {children.map((child, index) => (
            <div key={index} className="w-full flex-shrink-0">
              {child}
            </div>
          ))}
        </div>
      </div>

      {showArrows && totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-colors z-10"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-colors z-10"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

// Horizontal Scroll Carousel for Contest Details
function HorizontalCarousel({
  children,
  className = '',
}: {
  children: React.ReactNode[]
  className?: string
}) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (containerRef) {
      setMaxScroll(containerRef.scrollWidth - containerRef.clientWidth)
    }
  }, [containerRef])

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef) return
    const scrollAmount = 320
    const newPosition = direction === 'left'
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(maxScroll, scrollPosition + scrollAmount)
    containerRef.scrollTo({ left: newPosition, behavior: 'smooth' })
    setScrollPosition(newPosition)
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={setContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>
      <div className="flex justify-center gap-2 mt-4">
        <button
          onClick={() => scroll('left')}
          className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          aria-label="Scroll left"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => scroll('right')}
          className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          aria-label="Scroll right"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const awards = [
    {
      image: 'https://picsum.photos/seed/phone/300/300',
      title: 'Award Name',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation.',
    },
    {
      image: 'https://picsum.photos/seed/tablet/300/300',
      title: 'Fast Start Award',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation.',
    },
    {
      image: 'https://picsum.photos/seed/vegas/300/300',
      title: 'Award Name',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation.',
    },
  ]

  const contestDetails = [
    {
      title: 'Contest Detail 1',
      content: 'Explore what elements to focus on. Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit sed quia non numquam eius modi tempora incidunt ut labore.',
    },
    {
      title: 'Contest Detail 2',
      content: 'Explore what elements to focus on. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
      title: 'Contest Detail 3',
      content: 'Explore what elements to focus on. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    },
    {
      title: 'Contest Detail 4',
      content: 'Explore what elements to focus on. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    },
  ]

  const resources = [
    {
      icon: 'document',
      title: 'Program Rules',
      description: 'Lorem ipsum dolor sit amet, quis nostrud exercitation ullamco laboris nisi ut aliquip ex.',
    },
    {
      icon: 'checklist',
      title: 'Best Practices',
      description: 'Lorem ipsum dolor sit amet, quis nostrud exercitation ullamco laboris nisi ut aliquip ex.',
    },
    {
      icon: 'release',
      title: 'Release',
      description: 'Lorem ipsum dolor sit amet, quis nostrud exercitation ullamco laboris nisi ut aliquip ex.',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="text-2xl font-light tracking-wide">
                <span className="text-gray-800">sp</span>
                <span className="relative inline-block">
                  <span className="text-yellow-400">o</span>
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                </span>
                <span className="text-gray-800">tlight</span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#awards" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Awards</a>
              <a href="#details" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Details</a>
              <a href="#demo" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Demo</a>
              <a href="#overview" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Overview</a>
              <a href="#resources" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Resources</a>
            </nav>

            {/* Video Upload Button */}
            <div className="hidden md:block">
              <button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-sm font-semibold py-2 px-4 rounded uppercase tracking-wide transition-colors">
                Video Upload
              </button>
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
                <a href="#awards" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Awards</a>
                <a href="#details" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Details</a>
                <a href="#demo" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Demo</a>
                <a href="#overview" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Overview</a>
                <a href="#resources" className="text-sm text-gray-600 hover:text-gray-900 uppercase tracking-wide">Resources</a>
                <button className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-semibold py-2 px-4 rounded uppercase tracking-wide w-full mt-2">
                  Video Upload
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        {/* Background Image Placeholder */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://picsum.photos/seed/car/1920/600)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/80 via-orange-500/70 to-red-500/60"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Your Sales Skills<br />Deserve the Spotlight!
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Show off your best Walkaround skills and win.
            </p>

            {/* Key Dates */}
            <div className="mt-8">
              <p className="text-sm uppercase tracking-wider mb-4 font-semibold">Key Dates</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {/* Program Dates */}
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4 min-w-[140px]">
                  <p className="text-xs uppercase tracking-wider mb-2 opacity-80">Program Dates</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <div className="text-center">
                      <p className="text-xs uppercase">Aug</p>
                      <p className="text-3xl font-bold">15</p>
                    </div>
                    <span className="text-2xl">-</span>
                    <div className="text-center">
                      <p className="text-xs uppercase">Sept</p>
                      <p className="text-3xl font-bold">5</p>
                    </div>
                  </div>
                </div>

                {/* Fast Start Award */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 min-w-[140px]">
                  <p className="text-xs uppercase tracking-wider mb-2 opacity-80">Fast Start Award</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <div className="text-center">
                      <p className="text-xs uppercase">Aug</p>
                      <p className="text-3xl font-bold">15-20</p>
                    </div>
                  </div>
                </div>

                {/* Video Deadline */}
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 min-w-[140px]">
                  <p className="text-xs uppercase tracking-wider mb-2 opacity-80">Video Deadline</p>
                  <div className="text-center">
                    <p className="text-xs uppercase">Sept</p>
                    <p className="text-3xl font-bold">5</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section id="awards" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Awards</h2>

          <Carousel className="px-12">
            {[
              <div key="slide1" className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                {awards.map((award, index) => (
                  <div key={index} className="text-center">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                      <img
                        src={award.image}
                        alt={award.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{award.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{award.description}</p>
                  </div>
                ))}
              </div>,
              <div key="slide2" className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                {awards.map((award, index) => (
                  <div key={index} className="text-center">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                      <img
                        src={`https://picsum.photos/seed/award${index + 3}/300/300`}
                        alt={award.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{award.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{award.description}</p>
                  </div>
                ))}
              </div>,
            ]}
          </Carousel>
        </div>
      </section>

      {/* Contest Details Section */}
      <section id="details" className="py-16 bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-10">Contest Details</h2>

          <HorizontalCarousel>
            {contestDetails.map((detail, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-72 bg-white/10 backdrop-blur-sm rounded-lg p-6"
              >
                <h3 className="font-semibold text-white text-lg mb-3">{detail.title}</h3>
                <p className="text-white/90 text-sm leading-relaxed">{detail.content}</p>
              </div>
            ))}
          </HorizontalCarousel>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Demo Video</h2>

          <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
            {/* Video Thumbnail Placeholder */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: 'url(https://picsum.photos/seed/video/1280/720)',
              }}
            >
              <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Play Button and Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <h3 className="text-2xl md:text-4xl font-bold mb-2">
                <span className="text-pink-400">How To</span> Guide:
              </h3>
              <h3 className="text-2xl md:text-4xl font-bold">
                Video C<span className="text-pink-400">o</span>mpetition
              </h3>

              {/* Play Button */}
              <button className="mt-6 w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contest Overview Section */}
      <section id="overview" className="py-16 bg-gradient-to-r from-red-500 via-red-600 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Contest Overview</h2>
          <p className="text-lg font-medium mb-2">This section gives a quick overview of the contest.</p>
          <p className="text-white/80 text-sm mb-8 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>

          {/* Timeline */}
          <div className="space-y-4 border-t border-white/20 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-white/20">
              <span className="font-semibold sm:w-auto">Program Dates:</span>
              <span className="sm:ml-2">August 15 - September 5, 2025</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-white/20">
              <span className="font-semibold sm:w-auto">Fast Start:</span>
              <span className="sm:ml-2">August 15 - August 20, 2025</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-white/20">
              <span className="font-semibold sm:w-auto">Video Submission Deadline:</span>
              <span className="sm:ml-2">September 5, 2025</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-white/20">
              <div>
                <span className="font-semibold">District Voting:</span>
                <span className="ml-2">September 6 - September 11, 2025</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-white/20">
              <span className="font-semibold sm:w-auto">District Winners Announced:</span>
              <span className="sm:ml-2">September 12, 2025</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-white/20">
              <div>
                <span className="font-semibold">Regional Voting:</span>
                <span className="ml-2">September 12 - September 17, 2025</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-white/20">
              <span className="font-semibold sm:w-auto">Regional Winners Announced:</span>
              <span className="sm:ml-2">September 18, 2025</span>
            </div>
          </div>

          <p className="mt-6 text-sm">
            Refer to <a href="#" className="underline hover:no-underline">Program Rules</a> for complete program information.
          </p>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Resources</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                {/* Icon */}
                <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  {resource.icon === 'document' && (
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {resource.icon === 'checklist' && (
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  )}
                  {resource.icon === 'release' && (
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{resource.description}</p>

                {/* Download Link */}
                <a href="#" className="inline-flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Help</a>
              <span className="text-gray-300">|</span>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Privacy</a>
              <span className="text-gray-300">|</span>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">© 2025 BI Worldwide</a>
            </div>

            {/* Logo */}
            <div className="text-xl font-light tracking-wide">
              <span className="text-gray-600">sp</span>
              <span className="relative inline-block">
                <span className="text-yellow-400">o</span>
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></span>
              </span>
              <span className="text-gray-600">tlight</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
