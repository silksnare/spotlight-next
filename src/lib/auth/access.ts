import type { AppRole } from './roles';

export const routeRoleRequirements: Array<{ prefix: string; roles: AppRole[] }> = [
  { prefix: '/upload', roles: ['uploader'] },
  { prefix: '/qualify', roles: ['qualifier'] },
  { prefix: '/judge/round-1', roles: ['qualifier'] },
  { prefix: '/judge/round-2', roles: ['judge2'] },
  { prefix: '/vote', roles: ['__disabled__' as AppRole] },
  { prefix: '/admin', roles: ['admin'] },
  { prefix: '/api/admin', roles: ['admin'] },
  { prefix: '/api/qualify', roles: ['qualifier'] },
  { prefix: '/api/qualify/', roles: ['qualifier'] },
];

export function requiredRolesForPath(pathname: string): AppRole[] {
  const match = routeRoleRequirements.find((entry) => pathname.startsWith(entry.prefix));
  return match?.roles ?? [];
}

export function hasAnyRole(userRoles: string[], requiredRoles: AppRole[]): boolean {
  if (requiredRoles.length === 0) return true;
  return requiredRoles.some((role) => userRoles.includes(role));
}
