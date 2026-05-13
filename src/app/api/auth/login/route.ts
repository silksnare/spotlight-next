import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { compareValue, normalizeEmail } from '@/lib/auth/local-auth';
import { setSessionCookie } from '@/lib/auth/session';
import { buildLocalSession } from '@/lib/auth/local-session';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const cred = await prisma.localAuthCredential.findUnique({ where: { email: normalizeEmail(email) }, include: { user: { include: { userRoles: true } } } });
  if (!cred || !cred.emailVerified || !(await compareValue(password, cred.passwordHash))) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  await prisma.userRole.createMany({ data: [{ userId: cred.user.id, role: "uploader" }], skipDuplicates: true });
  const userWithRoles = await prisma.user.findUniqueOrThrow({ where: { id: cred.user.id }, include: { userRoles: true } });
  const response = NextResponse.json({ ok: true });
  await setSessionCookie(response, buildLocalSession(userWithRoles));
  return response;
}
