import Image from 'next/image';
import Link from 'next/link';

import { getCurrentSession } from '@/lib/auth/session';

export default async function Footer() {
  const session = await getCurrentSession();

  return (
    <footer className="pt-[30px]">
      <div className="mx-auto max-w-7xl px-6 pb-6">
        <div className="border-t-[2px] border-[#2a2528] pt-6">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
            
            {/* Lexus Logo */}
            <div className="shrink-0">
              <Link href="/" aria-label="Lexus home">
                <Image
                  src="/images/logo.jpg"
                  alt="Lexus"
                  width={564}
                  height={60}
                  className="h-auto w-[160px] sm:w-[180px] md:w-[200px]"
                  priority
                />
              </Link>
            </div>

            {/* Links */}
            <div className="text-center text-[14px] text-[#161624]">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {session ? (
                  <>
                    <form
                      action="/api/auth/logout"
                      method="post"
                      className="inline"
                    >
                      <button type="submit" className="hover:underline">
                        Logout
                      </button>
                    </form>
                    <span>|</span>
                  </>
                ) : null}

                <a
                  href="mailto:LexusMPI@biworldwide.com?subject=Spotlight%20Support"
                  className="hover:underline"
                >
                  Help
                </a>

                <span>|</span>

                <a
                  href="https://actdevpprd.biworldwide.com/lexus/26MPI_DataPrivacyPolicy.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Privacy
                </a>

                <span>|</span>

                <span>©2026 BIWorldwide</span>
              </div>
            </div>

            {/* BI Logo */}
            <div className="shrink-0">
              <Image
                src="/images/biw-logo.jpg"
                alt="BIWorldwide"
                width={320}
                height={60}
                className="h-auto w-[120px] sm:w-[140px] md:w-[150px]"
              />
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}