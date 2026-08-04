import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'

import { getCurrentSession } from '@/lib/auth/session'
import { isPhaseActive } from '@/lib/phases/is-phase-active'
import { prisma } from '@/lib/prisma'

import { HeaderNavClient } from '@/components/HeaderNavClient'

type AppRole = 'uploader' | 'qualifier' | 'judge1' | 'judge2' | 'admin' | 'client'

type NavLink = {
  href: string
  label: string
  roles: AppRole[]
  phaseKey?: string
  phaseKeys?: string[]
}

const ENABLE_VOTING = true

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
    phaseKeys: ['upload', 'judge_round_1'],
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
          roles: ['uploader', 'qualifier', 'judge1', 'judge2', 'admin', 'client'] as AppRole[],
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
    label: 'Admin',
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

  const phases = await prisma.phase.findMany({
    select: {
      key: true,
      startsAt: true,
      endsAt: true,
    },
  })

  const phaseMap = Object.fromEntries(
    phases.map((phase) => [phase.key, phase]),
  )

  const uploadPhase = phaseMap.upload
  const judgeRound1Phase = phaseMap.judge_round_1
  const now = new Date()

  let countdownMessage: string | null = null
  let countdownTargetDate: string | null = null

  if (uploadPhase?.endsAt && isPhaseActive(uploadPhase)) {
    countdownMessage = 'UPLOAD ENDS IN'
    countdownTargetDate = uploadPhase.endsAt.toISOString()
  } else if (
    judgeRound1Phase?.startsAt &&
    now < judgeRound1Phase.startsAt
  ) {
    countdownMessage = 'JUDGING ROUND 1 STARTS IN'
    countdownTargetDate = judgeRound1Phase.startsAt.toISOString()
  } else if (judgeRound1Phase?.endsAt && isPhaseActive(judgeRound1Phase)) {
    countdownMessage = 'JUDGING ROUND 1 ENDS IN'
    countdownTargetDate = judgeRound1Phase.endsAt.toISOString()
  }

  const visibleLinks = navLinks.filter((link) => {
    if (!roles.length) return false
    if (!roles.some((r) => link.roles.includes(r))) return false

    const phaseKeys = link.phaseKeys ?? (link.phaseKey ? [link.phaseKey] : [])

    if (!phaseKeys.length) return true

    return phaseKeys.some((phaseKey) => {
      const phase = phaseMap[phaseKey]
      return isPhaseActive(phase)
    })
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2d2730] bg-[#151116]/95 backdrop-blur-md">
      <div className="relative flex w-full items-center justify-between gap-6 px-6 py-5 lg:px-10">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="Choose Your EV Conquest home"
        >
          <div className="text-[30px] font-semibold uppercase leading-[0.92] tracking-[0.08em] text-white lg:text-[34px]">
            <div>Choose Your</div>
            <div>EV Conquest</div>
          </div>
        </Link>

        <HeaderNavClient
          visibleLinks={visibleLinks}
          countdownMessage={countdownMessage}
          countdownTargetDate={countdownTargetDate}
        />
      </div>
    </header>
  )
}