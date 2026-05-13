import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { compareValue, hashValue, isStrongPassword, normalizeEmail } from '@/lib/auth/local-auth';

export async function POST(request: NextRequest) {
  const { email, code, password, confirmPassword } = await request.json();
  if (password !== confirmPassword || !isStrongPassword(password)) return NextResponse.json({ error: 'Invalid password' }, { status: 400 });
  const cred = await prisma.localAuthCredential.findUnique({ where: { email: normalizeEmail(email) } });
  if (!cred?.passwordResetCodeHash || !cred.passwordResetCodeExpiresAt || cred.passwordResetCodeExpiresAt < new Date()) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
  if (!(await compareValue(String(code), cred.passwordResetCodeHash))) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
  await prisma.localAuthCredential.update({ where: { id: cred.id }, data: { passwordHash: await hashValue(password), passwordResetCodeHash: null, passwordResetCodeExpiresAt: null, emailVerified: true, emailVerifiedAt: cred.emailVerifiedAt ?? new Date() } });
  return NextResponse.json({ ok: true });
}
