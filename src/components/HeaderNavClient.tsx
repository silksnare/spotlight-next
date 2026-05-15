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

export function HeaderNavClient({
  visibleLinks,
  countdownMessage,
  countdownTargetDate,
}: HeaderNavClientProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile */}
      <div className="flex items-center gap-4 min-[1200px]:hidden">
        {countdownTargetDate && countdownMessage ? (
          <div className="flex flex-col items-end gap-[2px] leading-none">
            <div className="text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b8fa3]">
              {countdownMessage}
            </div>

            <div className="shrink-0 text-[16px] font-bold text-[#171327]">
              <PhaseCountdown
                message=""
                targetDate={countdownTargetDate}
              />
            </div>
          </div>
        ) : null}

        <div className="relative">
          <button
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-[48px] w-[48px] items-center justify-center rounded-xl border border-[#d8dbe7] bg-white text-[#161624] transition hover:bg-[#f8f8fc]"
          >
            <span className="sr-only">Menu</span>

            <span className="flex h-[18px] w-[22px] flex-col justify-between">
              <span className="block h-[2px] w-full bg-current" />
              <span className="block h-[2px] w-full bg-current" />
              <span className="block h-[2px] w-full bg-current" />
            </span>
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[320px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-[#ece8f4] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
              <nav className="flex flex-col">
                {visibleLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="border-b border-[#ece8f4] px-5 py-4 text-[14px] font-semibold uppercase tracking-[0.08em] text-[#171327] transition hover:bg-[#f8f8fc]"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ) : null}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden min-[1200px]:flex items-center justify-end gap-6">
        {countdownTargetDate && countdownMessage ? (
          <div className="flex flex-col items-start gap-[2px] leading-none">
            <div className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b8fa3]">
              {countdownMessage}
            </div>

            <div className="shrink-0 text-[34px] font-bold leading-none tracking-tight text-[#171327]">
              <PhaseCountdown
                message=""
                targetDate={countdownTargetDate}
              />
            </div>
          </div>
        ) : null}

        <nav className="flex items-center gap-3">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex h-[52px] items-center justify-center whitespace-nowrap rounded-xl bg-[#ff6a13] px-7 text-center text-[14px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_10px_30px_rgba(255,106,19,0.28)] transition hover:translate-y-[-1px] hover:bg-[#f05f0f] hover:shadow-[0_14px_34px_rgba(255,106,19,0.34)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}