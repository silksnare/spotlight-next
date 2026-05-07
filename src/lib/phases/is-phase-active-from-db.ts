import { prisma } from '@/lib/prisma';
import { isPhaseActive } from '@/lib/phases/is-phase-active';

export async function isPhaseActiveFromDb(phaseKey: string) {
  const phase = await prisma.phase.findUnique({
    where: { key: phaseKey },
    select: {
      startsAt: true,
      endsAt: true,
    },
  });

  return isPhaseActive(phase);
}
