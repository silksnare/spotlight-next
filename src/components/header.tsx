import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import Image from 'next/image'

import { getCurrentSession } from '@/lib/auth/session'
import { getNextPhaseEventFromDb } from '@/lib/phases/get-next-phase-event-from-db'
import { isPhaseActive } from '@/lib/phases/is-phase-active'
import { prisma } from '@/lib/prisma'

import { HeaderNavClient } from '@/components/HeaderNavClient'

type AppRole = 'uploader' | 'qualifier' | 'judge1' | 'judge2' | 'admin' | 'client'

type NavLink = {
  href: string
  label: string
  roles: AppRole[]
  phaseKey?: string
}

const ENABLE_VOTING = false

const navLinks: NavLink[] = [
  {
    href: '/upload',
    label: 'Video Upload',
    roles: ['uploader'],
    phaseKey: 'upload',
  },
  {
    href: '/qualify',
    label: 'Qualify',
    roles: ['qualifier'],
    phaseKey: 'upload',
  },
  {
    href: '/judge/round-1',
    label: 'Judge 1',
    roles: ['qualifier', 'judge1'],
    phaseKey: 'judge_round_1',
  },
  {
    href: '/judge/round-2',
    label: 'Judge',
    roles: ['judge2'],
    phaseKey: 'judge_round_2',
  },
  ...(ENABLE_VOTING
    ? [
        {
          href: '/vote',
          label: 'Vote',
          roles: ['uploader', 'qualifier', 'judge1', 'judge2', 'admin'] as AppRole[],
          phaseKey: 'vote',
        },
      ]
    : []),
  {
    href: '/admin',
    label: 'Client',
    roles: ['client'],
  },
  {
    href: '/platform-admin',
    label: 'Platform Admin',
    roles: ['admin'],
  },
]

export async function Header() {
  noStore()

  const session = await getCurrentSession()
  const role = session?.user?.role as AppRole | undefined
  const roles =
    session?.user && 'roles' in session.user && Array.isArray(session.user.roles)
      ? (session.user.roles as AppRole[])
      : role
        ? [role]
        : []

  const nextPhaseEvent = await getNextPhaseEventFromDb()

  const phases = await prisma.phase.findMany({
    select: {
      key: true,
      startsAt: true,
      endsAt: true,
    },
  })

  const phaseMap = Object.fromEntries(phases.map((phase) => [phase.key, phase]))

  const visibleLinks = navLinks.filter((link) => {
    if (!roles.length) return false
    if (!roles.some((r) => link.roles.includes(r))) return false

    if (!link.phaseKey) return true

    const phase = phaseMap[link.phaseKey]
    return isPhaseActive(phase)
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#ece8f4] bg-white/90 backdrop-blur-md">
      <div className="relative flex w-full items-center justify-between gap-6 px-6 py-5 lg:px-10">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          aria-label="Spotlight Next home"
        >
          <Image
            src="/icons/icon-192x192-sharp.png"
            alt=""
            width={42}
            height={42}
            className="h-10 w-10 object-contain"
            priority
          />

          <div>
            <div className="text-2xl font-extrabold leading-none tracking-tight text-[#111322]">
              Spotlight Next
            </div>
            <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#8b8fa3]">
              BI WORLDWIDE
            </div>
          </div>
        </Link>

        <HeaderNavClient
          visibleLinks={visibleLinks}
          countdownMessage={nextPhaseEvent?.message ?? null}
          countdownTargetDate={nextPhaseEvent?.targetDate.toISOString() ?? null}
        />
      </div>
    </header>
  )
}