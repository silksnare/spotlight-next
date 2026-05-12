import type { User } from '@prisma/client';
import type { AppSession } from './session';

export function buildLocalSession(user: User): AppSession {
  return {
    user: {
      id: user.id,
      employeeId: user.employeeId,
      name: user.displayName,
      email: user.email,
      role: 'uploader',
      homeArea: user.homeArea,
      district: user.district,
    },
  };
}
