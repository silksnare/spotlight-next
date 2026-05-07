import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const phaseArg = process.argv[2]

  if (!phaseArg) {
    console.error('Usage: npm run phase <upload|judge1|judge2>')
    process.exit(1)
  }

  const now = new Date()
  const oldPast = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
  const past = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const future = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const phaseMap: Record<string, string> = {
    upload: 'upload',
    judge1: 'judge_round_1',
    judge2: 'judge_round_2',
  }

  const activePhase = phaseMap[phaseArg]

  if (!activePhase) {
    console.error(`Invalid phase: ${phaseArg}`)
    console.error('Usage: npm run phase <upload|judge1|judge2>')
    process.exit(1)
  }

  const allPhases = ['upload', 'judge_round_1', 'judge_round_2']

  for (const key of allPhases) {
    await prisma.phase.update({
      where: { key },
      data: {
        startsAt: key === activePhase ? past : oldPast,
        endsAt: key === activePhase ? future : past,
        isActive: key === activePhase,
      },
    })
  }

  console.log(`Switched active phase to: ${activePhase}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
