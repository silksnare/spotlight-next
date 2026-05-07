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

const dashboardAnchorLinks = [
  { href: '/dashboard#award', label: 'Awards' },
  { href: '/dashboard#contest-details', label: 'Contest Details' },
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
      <div className="flex items-center gap-4 min-[1200px]:hidden">
        {countdownTargetDate && countdownMessage ? (
          <div className="flex flex-col items-end gap-[2px] leading-none">
            <div className="text-right text-[11px] font-light uppercase tracking-[0.02em] text-[#4d4d55]">
              {countdownMessage}
            </div>

            <div className="shrink-0 text-[16px] font-semibold text-[#161624]">
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
            className="inline-flex h-[48px] w-[48px] items-center justify-center border border-[#161624] text-[#161624] transition hover:bg-[#161624] hover:text-white"
          >
            <span className="sr-only">Menu</span>
            <span className="flex h-[18px] w-[22px] flex-col justify-between">
              <span className="block h-[2px] w-full bg-current" />
              <span className="block h-[2px] w-full bg-current" />
              <span className="block h-[2px] w-full bg-current" />
            </span>
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[320px] max-w-[calc(100vw-32px)] overflow-hidden border border-[#d9d9db] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
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
                          ? 'border-b border-[#d9d9db] bg-[linear-gradient(90deg,#171723_0%,#231b1b_100%)] px-5 py-4 text-[16px] font-extrabold uppercase text-white transition hover:opacity-90'
                          : 'border-b border-[#d9d9db] px-5 py-4 text-[14px] font-light uppercase text-[#5b5b63] transition hover:bg-[#f5f5f7] hover:text-[#161624]'
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

      <div className="hidden min-[1200px]:flex justify-center">
        {isDashboard ? (
          <nav className="flex items-center gap-4">
            {dashboardAnchorLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap text-[14px] font-light uppercase text-[#5b5b63] transition hover:text-[#161624]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>

      <div className="hidden min-[1200px]:flex items-center justify-end gap-5">
        {countdownTargetDate && countdownMessage ? (
          <div className="flex flex-col items-start gap-[2px] leading-none">
            <div className="text-left text-[14px] font-light uppercase tracking-[0.02em] text-[#4d4d55]">
              {countdownMessage}
            </div>

            <div className="shrink-0 text-[18px] font-semibold text-[#161624]">
              <PhaseCountdown
                message=""
                targetDate={countdownTargetDate}
              />
            </div>
          </div>
        ) : null}

        <nav className="flex items-center">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center justify-center whitespace-nowrap bg-[linear-gradient(90deg,#171723_0%,#231b1b_100%)] px-6 py-3 text-center text-[16px] font-semibold uppercase text-white transition hover:opacity-85"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}