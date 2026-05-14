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
    if (!role) return false
    if (!roles.some((r) => link.roles.includes(r))) return false

    if (!link.phaseKey) return true

    const phase = phaseMap[link.phaseKey]
    return isPhaseActive(phase)
  })

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-6 min-[1200px]:grid min-[1200px]:gap-6 min-[1200px]:grid-cols-[250px_1fr_380px]">
        <div className="flex items-center">
          <Link href="/" className="shrink-0" aria-label="Lexus home">
            <Image
              src="/images/logo.jpg"
              alt="logo"
              width={564}
              height={60}
              className="h-auto w-[150px] sm:w-[250px]"
              priority
            />
          </Link>
        </div>

        <HeaderNavClient
          visibleLinks={visibleLinks}
          countdownMessage={nextPhaseEvent?.message ?? null}
          countdownTargetDate={nextPhaseEvent?.targetDate.toISOString() ?? null}
        />
      </div>
    </header>
  )
}