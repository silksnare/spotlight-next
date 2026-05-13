import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { CODE_EXPIRY_MS, CODE_RESEND_COOLDOWN_MS, generateSixDigitCode, hashValue, normalizeEmail } from '@/lib/auth/local-auth';
import { sendEmail } from '@/lib/email/send-email';
import { passwordResetCodeEmailTemplate } from '@/lib/email/templates';

export async function POST(request: NextRequest) { const { email } = await request.json(); const cred = await prisma.localAuthCredential.findUnique({ where: { email: normalizeEmail(email) } }); if (!cred) return NextResponse.json({ ok: true }); if (cred.passwordResetCodeSentAt && Date.now()-cred.passwordResetCodeSentAt.getTime()<CODE_RESEND_COOLDOWN_MS) return NextResponse.json({ ok: true }); const code=generateSixDigitCode(); await prisma.localAuthCredential.update({ where:{id:cred.id}, data:{passwordResetCodeHash:await hashValue(code), passwordResetCodeExpiresAt:new Date(Date.now()+CODE_EXPIRY_MS), passwordResetCodeSentAt:new Date()} }); await sendEmail({to:cred.email,...passwordResetCodeEmailTemplate(code)}); return NextResponse.json({ok:true}); }
