type PhaseLike = {
  key: string;
  label: string;
  startsAt: Date | string | null;
  endsAt: Date | string | null;
};

type PhaseEvent = {
  phaseKey: string;
  phaseLabel: string;
  eventType: 'start' | 'end';
  targetDate: Date;
  message: string;
};

export type NextPhaseEvent = PhaseEvent | null;

export function getNextPhaseEvent(
  phases: PhaseLike[],
  now = new Date()
): NextPhaseEvent {
  const candidates: PhaseEvent[] = [];

  for (const phase of phases) {
    const startsAt = phase.startsAt ? new Date(phase.startsAt) : null;
    const endsAt = phase.endsAt ? new Date(phase.endsAt) : null;

    if (startsAt && now < startsAt) {
      candidates.push({
        phaseKey: phase.key,
        phaseLabel: phase.label,
        eventType: 'start',
        targetDate: startsAt,
        message: `${phase.label} starts in`,
      });
    }

    if (startsAt && endsAt && now >= startsAt && now < endsAt) {
      candidates.push({
        phaseKey: phase.key,
        phaseLabel: phase.label,
        eventType: 'end',
        targetDate: endsAt,
        message: `${phase.label} ends in`,
      });
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort(
    (a, b) => a.targetDate.getTime() - b.targetDate.getTime()
  );

  return candidates[0];
}