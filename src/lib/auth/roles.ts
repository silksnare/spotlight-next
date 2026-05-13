export const APP_ROLES = ['uploader', 'qualifier', 'judge1', 'judge2', 'admin', 'client'] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  uploader: 'Uploader',
  qualifier: 'Qualifier',
  judge1: 'Judge 1',
  judge2: 'Judge 2',
  admin: 'Admin',
  client: 'Client',
};

const ROLE_ALIASES: Record<string, AppRole> = {
  uploader: 'uploader',
  qualifier: 'qualifier',
  judge1: 'judge1',
  judge_1: 'judge1',
  judge_round_1: 'judge1',
  judge2: 'judge2',
  judge_2: 'judge2',
  judge_round_2: 'judge2',
  admin: 'admin',
  client_admin: 'admin',
  super_admin: 'admin',
  client: 'client',
};

export function normalizeRole(input: unknown): AppRole | null {
  if (typeof input !== 'string') return null;
  const normalized = input.trim().toLowerCase();
  return ROLE_ALIASES[normalized] ?? null;
}

export function normalizeRoles(input: unknown): AppRole[] {
  const values = Array.isArray(input)
    ? input
    : typeof input === 'string'
      ? input.split(',').map((x) => x.trim())
      : [];

  const mapped = values
    .map((value) => normalizeRole(value))
    .filter((value): value is AppRole => value !== null);

  return Array.from(new Set(mapped));
}
