import type { User, UserRole } from '@prisma/client';
import type { AppRole } from './roles';
import type { AppSession } from './session';

const ROLE_PRIORITY: AppRole[] = ['admin', 'qualifier', 'judge2', 'judge1', 'client', 'uploader'];

function highestPriorityRole(roles: AppRole[]): AppRole {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return role;
  }
  return 'uploader';
}

export function buildLocalSession(user: User & { userRoles?: UserRole[] }): AppSession {
  const roles = (user.userRoles ?? []).map((r) => r.role as AppRole);
  const uniqueRoles = Array.from(new Set(roles));
  const resolvedRoles = uniqueRoles.length ? uniqueRoles : ['uploader'];

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
