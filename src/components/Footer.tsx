'use client'

import { useEffect, useState } from 'react'

export default function Footer() {
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    let active = true

    fetch('/api/auth/session')
      .then((response) => response.json())
      .then((session) => {
        if (active) {
          setHasSession(Boolean(session?.session?.user))
        }
      })
      .catch(() => {
        if (active) {
          setHasSession(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <footer className="bg-[#1b171c]">
      <div className="mx-auto max-w-[1400px] px-6 py-14">
        <div className="flex flex-col items-center">
          <div className="text-center">
            <img
              src="/images/cadillac.png"
              alt="Cadillac"
              className="mx-auto h-auto w-[200px] lg:w-[300px]"
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-center text-[12px] font-medium uppercase tracking-[0.18em] text-[#b7b2bb]">
            {hasSession ? (
              <>
                <form action="/api/auth/logout" method="post" className="inline">
                  <button type="submit" className="transition hover:text-white">
                    LOGOUT
                  </button>
                </form>

                <span>|</span>
              </>
            ) : null}

            <a
              href="mailto:CadillacEVConquestHQ@biworldwide.com?subject=Cadillac%20EV%20Conquest%20Support"
              className="transition hover:text-white"
            >
              Help
            </a>

            <span>|</span>

            <a
              href="/documents/Data-Privacy-Policy.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white"
            >
              Privacy
            </a>

            <span>|</span>

            <span>©2026 BI WORLDWIDE</span>
          </div>

          <div className="mt-10 text-center">
            <div className="font-[family:var(--font-cadillac)] text-[22px] font-bold uppercase leading-[0.9] tracking-[0.08em] text-white">
              <div>Choose Your</div>
              <div>EV Conquest</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}