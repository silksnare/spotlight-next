type PhaseWindow = {
  startsAt: Date | string | null;
  endsAt: Date | string | null;
};

export function isPhaseActive(
  phase: PhaseWindow | null | undefined,
  now = new Date()
) {
  if (!phase?.startsAt || !phase?.endsAt) {
    return false;
  }

  const startsAt = new Date(phase.startsAt);
  const endsAt = new Date(phase.endsAt);

  return now >= startsAt && now < endsAt;
}
