import { prisma } from '@/lib/db/prisma';
import { getCurrentSession } from '@/lib/auth/session';
import { getSessionRoles } from '@/lib/auth/access';
import { redirect } from 'next/navigation';
import PlatformAdminClient from './platform-admin-client';

export default async function PlatformAdminPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await getCurrentSession();
  if (!session || !getSessionRoles(session.user).includes('admin')) redirect('/unauthorized');
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  const users = await prisma.user.findMany({
    where: query
      ? { OR: [{ email: { contains: query, mode: 'insensitive' } }, { displayName: { contains: query, mode: 'insensitive' } }] }
      : undefined,
    include: { localAuthCredential: true, userRoles: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return <PlatformAdminClient users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))} q={query} />;
}
