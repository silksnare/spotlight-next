import { redirect } from 'next/navigation';

import { getSessionRoles } from '@/lib/auth/access';
import { getCurrentSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

import PlatformAdminClient from './platform-admin-client';

export default async function PlatformAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getCurrentSession();

  if (!session || !getSessionRoles(session.user).includes('admin')) {
    redirect('/unauthorized');
  }

  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  const [users, phases] = await Promise.all([
    prisma.user.findMany({
      where: query
        ? {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { displayName: { contains: query, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        localAuthCredential: true,
        userRoles: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 200,
    }),

    prisma.phase.findMany({
      orderBy: {
        startsAt: 'asc',
      },
    }),
  ]);

  return (
    <PlatformAdminClient
      q={query}
      users={users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      }))}
      phases={phases.map((phase) => ({
        id: phase.id,
        key: phase.key,
        label: phase.label,
        startsAt: phase.startsAt?.toISOString() ?? '',
        endsAt: phase.endsAt?.toISOString() ?? '',
      }))}
    />
  );
}
