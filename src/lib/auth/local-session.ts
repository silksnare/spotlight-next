import type { User, UserRole } from '@prisma/client';

import type { AppSession } from './session';

export type AppRole = 'admin' | 'qualifier' | 'judge2' | 'judge1' | 'client' | 'uploader';

const ROLE_PRIORITY: AppRole[] = ['admin', 'qualifier', 'judge2', 'judge1', 'client', 'uploader'];

const VALID_ROLES: AppRole[] = ['admin', 'qualifier', 'judge2', 'judge1', 'client', 'uploader'];

function isAppRole(role: string): role is AppRole {
  return VALID_ROLES.includes(role as AppRole);
}

function highestPriorityRole(roles: AppRole[]): AppRole {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return role;
  }

  return 'uploader';
}

export function buildLocalSession(user: User & { userRoles?: UserRole[] }): AppSession {
  const roles = (user.userRoles ?? [])
    .map((r) => r.role)
    .filter(isAppRole);

  const uniqueRoles: AppRole[] = Array.from(new Set(roles));

  const resolvedRoles: AppRole[] = uniqueRoles.length ? uniqueRoles : ['uploader'];

  return {
    user: {
      id: user.id,
      employeeId: user.employeeId,
      name: user.displayName,
      email: user.email,
      role: highestPriorityRole(resolvedRoles),
      roles: resolvedRoles,
      homeArea: user.homeArea,
      district: user.district,
    },
  };
}