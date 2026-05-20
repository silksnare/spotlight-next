import Image from 'next/image'
import Link from 'next/link'

import { getCurrentSession } from '@/lib/auth/session'

export default async function Footer() {
  const session = await getCurrentSession()

  return (
    <footer className="relative overflow-hidden bg-[#0d1020] text-white">
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#7f56ff]/20 blur-3xl" />

      <div className="pointer-events-none absolute right-0 top-0 hidden grid-cols-8 gap-4 opacity-70 md:grid">
        {Array.from({ length: 80 }).map((_, index) => (
          <span
            key={index}
            className="h-2 w-2 rounded-full bg-[#d14fc7] shadow-[0_0_10px_rgba(209,79,199,0.8)]"
          />
        ))}
      </div>

      <div className="page-container relative py-12">
        <div className="grid gap-10 md:grid-cols-[1fr_auto_1fr] md:items-center">
          
          {/* Left */}
          <Link
            href="/"
            className="flex items-center gap-4 md:justify-self-start"
            aria-label="Spotlight Next home"
          >
            <Image
              src="/icons/icon-192x192-sharp.png"
              alt=""
              width={58}
              height={58}
              className="h-14 w-14 object-contain"
            />

            <div>
              <div className="text-3xl font-extrabold leading-none tracking-tight">
                Spotlight Next
              </div>

              <div className="mt-2 text-sm font-medium text-white/70">
                Powered by BI WORLDWIDE
              </div>
            </div>
          </Link>

          {/* Center */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-center text-base font-semibold text-white/80">
            {session ? (
              <>
                <form action="/api/auth/logout" method="post" className="inline">
                  <button
                    type="submit"
                    className="transition hover:text-white"
                  >
                    Logout
                  </button>
                </form>

                <span className="text-white/35">|</span>
              </>
            ) : null}

            <a
              href="mailto:LexusMPI@biworldwide.com?subject=Spotlight%20Support"
              className="transition hover:text-white"
            >
              Help
            </a>

            <span className="text-white/35">|</span>

            <a
              href="https://actdevpprd.biworldwide.com/lexus/26MPI_DataPrivacyPolicy.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white"
            >
              Privacy
            </a>

            <span className="text-white/35">|</span>

            <span>© 2026 BI WORLDWIDE</span>
          </div>

          {/* Right Spacer */}
          <div className="hidden md:block" />

        </div>
      </div>
    </footer>
  )
}