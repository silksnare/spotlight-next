'use client'

import { useState, useEffect, useCallback } from 'react'

interface CarouselProps {
  children: React.ReactNode[]
  autoPlay?: boolean
  autoPlayInterval?: number
  showArrows?: boolean
  showDots?: boolean
  className?: string
  itemsPerView?: number
}

export default function Carousel({
  children,
  autoPlay = false,
  autoPlayInterval = 5000,
  showArrows = true,
  showDots = false,
  className = '',
  itemsPerView = 1,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const totalSlides = Math.ceil(children.length / itemsPerView)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  useEffect(() => {
    if (!autoPlay) return
    const interval = setInterval(nextSlide, autoPlayInterval)
    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, nextSlide])

  return (
    <div className={`relative ${className}`}>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div key={slideIndex} className="w-full flex-shrink-0">
              <div className="flex gap-4 justify-center">
                {children.slice(
                  slideIndex * itemsPerView,
                  slideIndex * itemsPerView + itemsPerView
                )}
              </div>
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
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-colors z-10"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {showDots && totalSlides > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-gray-800' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
