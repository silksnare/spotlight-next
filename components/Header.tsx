'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
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

          {/* Video Upload Button */}
          <div className="hidden md:block">
            <Link
              href="/upload"
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-sm font-semibold py-2 px-4 rounded uppercase tracking-wide transition-colors inline-block text-center leading-tight"
            >
              Video<br />Upload
            </Link>
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
              <Link
                href="/upload"
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-semibold py-2 px-4 rounded uppercase tracking-wide w-full mt-2 text-center"
              >
                Video Upload
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
