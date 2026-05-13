import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { CODE_EXPIRY_MS, CODE_RESEND_COOLDOWN_MS, generateSixDigitCode, hashValue, normalizeEmail } from '@/lib/auth/local-auth';
import { sendEmail } from '@/lib/email/send-email';
import { verificationCodeEmailTemplate } from '@/lib/email/templates';

export async function POST(request: NextRequest) { const { email } = await request.json(); const cred = await prisma.localAuthCredential.findUnique({ where: { email: normalizeEmail(email) } }); if (!cred) return NextResponse.json({ ok: true }); if (cred.verificationCodeSentAt && Date.now()-cred.verificationCodeSentAt.getTime()<CODE_RESEND_COOLDOWN_MS) return NextResponse.json({ error: 'Please wait before requesting another code.' }, { status: 429 }); const code=generateSixDigitCode(); await prisma.localAuthCredential.update({ where:{id:cred.id}, data:{verificationCodeHash: await hashValue(code), verificationCodeExpiresAt:new Date(Date.now()+CODE_EXPIRY_MS), verificationCodeSentAt:new Date()} }); await sendEmail({to:cred.email,...verificationCodeEmailTemplate(code)}); return NextResponse.json({ok:true}); }
