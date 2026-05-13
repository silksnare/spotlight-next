import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentSession } from '@/lib/auth/session';
import { getSessionRoles } from '@/lib/auth/access';

const ALLOWED = ['uploader', 'qualifier', 'judge1', 'judge2', 'admin', 'client'];

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session || !getSessionRoles(session.user).includes('admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const body = await request.json();
  
  type AppRole = (typeof ALLOWED)[number];

  const incoming = Array.isArray(body.roles) ? body.roles : [];

  let nextRoles: AppRole[] = incoming.filter(
    (role): role is AppRole =>
      typeof role === 'string' && ALLOWED.includes(role as AppRole),
  );

  nextRoles = Array.from(new Set(nextRoles));

  if (nextRoles.length === 0) {
    nextRoles = ['uploader'];
  }

  const target = await prisma.user.findUnique({ where: { id }, include: { userRoles: true } });
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const hadAdmin = target.userRoles.some((r) => r.role === 'admin');
  const willHaveAdmin = nextRoles.includes('admin');
  if (hadAdmin && !willHaveAdmin) {
    const adminCount = await prisma.userRole.count({ where: { role: 'admin' } });
    if (adminCount <= 1) return NextResponse.json({ error: 'Cannot remove final admin role' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.userRole.deleteMany({ where: { userId: id, role: { notIn: nextRoles } } }),
    prisma.userRole.createMany({ data: nextRoles.map((role) => ({ userId: id, role })), skipDuplicates: true }),
  ]);

  return NextResponse.json({ ok: true, roles: nextRoles });
}
