import type { AppSession } from './session';
import { normalizeRole } from './roles';

export function isDevBypassEnabled() {
  return process.env.AUTH_MODE === 'dev_bypass' && process.env.AUTH_DEV_BYPASS === 'true';
}

export function buildDevIdentity(): AppSession {
  const defaultRole = normalizeRole(process.env.AUTH_DEV_DEFAULT_ROLE ?? 'uploader') ?? 'uploader';

  return {
    user: {
      id: 'dev-user',
      employeeId: 'DEV00001',
      email: 'dev.user@example.com',
      name: 'Dev User',
      role: defaultRole,
      homeArea: null,
      district: null,
    },
  };
}
