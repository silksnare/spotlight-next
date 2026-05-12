import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { compareValue, normalizeEmail } from '@/lib/auth/local-auth';
import { setSessionCookie } from '@/lib/auth/session';
import { buildLocalSession } from '@/lib/auth/local-session';

export async function POST(request: NextRequest) {
  const { email, code } = await request.json();
  const cred = await prisma.localAuthCredential.findUnique({ where: { email: normalizeEmail(email) }, include: { user: true } });
  if (!cred?.verificationCodeHash || !cred.verificationCodeExpiresAt || cred.verificationCodeExpiresAt < new Date()) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
  const ok = await compareValue(String(code), cred.verificationCodeHash);
  if (!ok) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
  await prisma.localAuthCredential.update({ where: { id: cred.id }, data: { emailVerified: true, emailVerifiedAt: new Date(), verificationCodeHash: null, verificationCodeExpiresAt: null } });
  const response = NextResponse.json({ ok: true });
  await setSessionCookie(response, buildLocalSession(cred.user));
  return response;
}
