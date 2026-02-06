'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/login', label: 'Login' },
  { href: '/register', label: 'Register' },
  { href: '/upload', label: 'Upload' },
  { href: '/upload/video', label: 'Upload Video' },
  { href: '/admin', label: 'Admin Dashboard' },
  { href: '/judge', label: 'Judge Panel' },
  { href: '/vote', label: 'Peer Voting' },
  { href: '/super-admin', label: 'Super Admin' },
]

export default function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-[9999]">
      {/* Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden mb-2">
          <div className="px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold uppercase tracking-wider">
            All Views
          </div>
          <nav className="py-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-orange-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all"
        aria-label="Open navigation menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
    </div>
  )
}
