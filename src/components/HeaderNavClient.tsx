'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { PhaseCountdown } from '@/components/phase-countdown'

type VisibleLink = {
  href: string
  label: string
}

type HeaderNavClientProps = {
  visibleLinks: VisibleLink[]
  countdownMessage: string | null
  countdownTargetDate: string | null
}

const dashboardAnchorLinks: VisibleLink[] = [
  { href: '/dashboard#contest-details', label: 'Program Details' },
  { href: '/dashboard#award', label: 'Awards' },
  { href: '/dashboard#resources', label: 'Resources' },
]

export function HeaderNavClient({
  visibleLinks,
  countdownMessage,
  countdownTargetDate,
}: HeaderNavClientProps) {
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard'
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const menuLinks = [
    ...(isDashboard ? dashboardAnchorLinks : []),
    ...visibleLinks,
  ]

  return (
    <>
      {/* Mobile / Tablet */}
      <div className="flex items-center gap-4 min-[1500px]:hidden">
        {countdownTargetDate && countdownMessage ? (
          <div className="hidden flex-col items-end gap-[2px] leading-none sm:flex">
            <div className="text-right text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b5b0ba]">
              {countdownMessage}
            </div>

            <div className="shrink-0 text-[18px] font-bold leading-none tracking-[0.05em] text-white">
              <PhaseCountdown message="" targetDate={countdownTargetDate} />
            </div>
          </div>
        ) : null}

        <div className="relative">
          <button
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-[48px] w-[48px] items-center justify-center bg-white text-[#1f1b20] transition hover:bg-[#f1f1f1]"
          >
            <span className="sr-only">Menu</span>

            <span className="flex h-[18px] w-[22px] flex-col justify-between">
              <span className="block h-[2px] w-full bg-current" />
              <span className="block h-[2px] w-full bg-current" />
              <span className="block h-[2px] w-full bg-current" />
            </span>
          </button>

          {menuOpen && menuLinks.length > 0 ? (
            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[320px] max-w-[calc(100vw-32px)] overflow-hidden border border-[#2d2730] bg-[#151116] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <nav className="flex flex-col">
                {menuLinks.map((link) => {
                  const isPrimaryAction = visibleLinks.some(
                    (visibleLink) => visibleLink.href === link.href,
                  )

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={
                        isPrimaryAction
                          ? 'border-b border-[#2d2730] bg-white px-5 py-4 text-[14px] font-bold uppercase tracking-[0.18em] text-[#1b171c] transition hover:bg-[#f5f5f5]'
                          : 'border-b border-[#2d2730] px-5 py-4 text-[13px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#211b22]'
                      }
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          ) : null}
        </div>
      </div>

      {/* Desktop centered anchor links */}
      {isDashboard ? (
        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-10 min-[1500px]:flex">
          {dashboardAnchorLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.2em] text-[#b5b0ba] transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}

      {/* Desktop right-side countdown/actions */}
      <div className="ml-auto hidden items-center justify-end gap-8 min-[1500px]:flex">
        {countdownTargetDate && countdownMessage ? (
          <div className="flex flex-col items-start gap-[4px] leading-none">
            <div className="text-left text-[10px] font-semibold uppercase tracking-[0.24em] text-[#b5b0ba]">
              {countdownMessage}
            </div>

            <div className="shrink-0 text-[26px] font-bold leading-none tracking-[0.05em] text-white">
              <PhaseCountdown message="" targetDate={countdownTargetDate} />
            </div>
          </div>
        ) : null}

        <nav className="flex items-center gap-3">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex h-[54px] items-center justify-center whitespace-nowrap bg-white px-8 text-center text-[14px] font-bold uppercase tracking-[0.18em] text-[#1b171c] transition hover:bg-[#ececec]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}