import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { CODE_EXPIRY_MS, generateSixDigitCode, hashValue, isStrongPassword, isValidEmail, makeLocalEmployeeId, normalizeEmail } from '@/lib/auth/local-auth';
import { sendEmail } from '@/lib/email/send-email';
import { verificationCodeEmailTemplate } from '@/lib/email/templates';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (!isValidEmail(email) || !isStrongPassword(password)) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const e = normalizeEmail(email);
  const code = generateSixDigitCode();
  const [passwordHash, codeHash] = await Promise.all([hashValue(password), hashValue(code)]);
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MS);

  const existing = await prisma.localAuthCredential.findUnique({ where: { email: e } });
  if (existing) {
    await prisma.localAuthCredential.update({ where: { id: existing.id }, data: { passwordHash, verificationCodeHash: codeHash, verificationCodeExpiresAt: expiresAt, verificationCodeSentAt: new Date(), emailVerified: false, emailVerifiedAt: null } });
  } else {
    await prisma.localAuthCredential.create({ data: { email: e, passwordHash, verificationCodeHash: codeHash, verificationCodeExpiresAt: expiresAt, verificationCodeSentAt: new Date(), user: { create: { employeeId: makeLocalEmployeeId(), email: e, firstName: e.split('@')[0], lastName: 'User', displayName: e.split('@')[0] } } } });
  }
  await sendEmail({ to: e, ...verificationCodeEmailTemplate(code) });
  return NextResponse.json({ ok: true });
}
