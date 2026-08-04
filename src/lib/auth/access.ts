import type { AppRole } from './roles';

export const routeRoleRequirements: Array<{ prefix: string; roles: AppRole[] }> = [
  { prefix: '/upload', roles: ['uploader'] },
  { prefix: '/qualify', roles: ['qualifier'] },
  { prefix: '/judge/round-1', roles: ['judge1', 'qualifier'] },
  { prefix: '/judge/round-2', roles: ['judge2'] },
  { prefix: '/vote', roles: ['uploader', 'qualifier', 'judge1', 'judge2', 'admin', 'client'] },
  { prefix: '/platform-admin', roles: ['admin'] },
  { prefix: '/api/platform-admin', roles: ['admin'] },
  { prefix: '/admin', roles: ['client'] },
  { prefix: '/api/admin', roles: ['client'] },
  { prefix: '/api/qualify', roles: ['qualifier'] },
  { prefix: '/api/qualify/', roles: ['qualifier'] },
  { prefix: '/api/vote', roles: ['uploader', 'qualifier', 'judge1', 'judge2', 'admin', 'client'] },
];

export function requiredRolesForPath(pathname: string): AppRole[] {
  const match = routeRoleRequirements.find((entry) => pathname.startsWith(entry.prefix));
  return match?.roles ?? [];
}

export function getSessionRoles(user: { role?: string | null; roles?: string[] | null }): string[] {
  const roles = Array.isArray(user.roles) ? user.roles : [];
  if (roles.length > 0) return Array.from(new Set(roles));
  return user.role ? [user.role] : [];
}

export function hasAnyRole(userRoles: string[], requiredRoles: AppRole[]): boolean {
  if (requiredRoles.length === 0) return true;
  return requiredRoles.some((role) => userRoles.includes(role));
}
