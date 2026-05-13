import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { compareValue, normalizeEmail } from '@/lib/auth/local-auth';
import { setSessionCookie } from '@/lib/auth/session';
import { buildLocalSession } from '@/lib/auth/local-session';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const cred = await prisma.localAuthCredential.findUnique({ where: { email: normalizeEmail(email) }, include: { user: true } });
  if (!cred || !cred.emailVerified || !(await compareValue(password, cred.passwordHash))) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  await setSessionCookie(response, buildLocalSession(cred.user));
  return response;
}
