import { prisma } from '@/lib/prisma';
import {
  getNextPhaseEvent,
  type NextPhaseEvent,
} from '@/lib/phases/get-next-phase-event';

export async function getNextPhaseEventFromDb(): Promise<NextPhaseEvent> {
  const phases = await prisma.phase.findMany({
    select: {
      key: true,
      label: true,
      startsAt: true,
      endsAt: true,
    },
  });

  return getNextPhaseEvent(phases);
}
