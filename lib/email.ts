import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'strongmail2.biperf.com',
  port: Number(process.env.SMTP_PORT ?? 25),
  secure: false,
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
})

const fromAddress = process.env.MAIL_FROM ?? 'no-reply@spotlight.local'
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function sendVerificationEmail(email: string, firstName: string | null, urlToken: string, code: string) {
  const verifyLink = `${appUrl}/verify-email?token=${encodeURIComponent(urlToken)}&email=${encodeURIComponent(email)}`

  await transporter.sendMail({
    from: fromAddress,
    to: email,
    subject: 'Verify your Spotlight account',
    text: `Hi ${firstName ?? 'there'},\n\nUse this code to verify your account: ${code}\n\nOr click this link: ${verifyLink}\n\nIf you did not create this account, ignore this message.`,
  })
}

export async function sendPasswordResetEmail(email: string, firstName: string | null, urlToken: string) {
  const resetLink = `${appUrl}/reset-password?token=${encodeURIComponent(urlToken)}`

  await transporter.sendMail({
    from: fromAddress,
    to: email,
    subject: 'Reset your Spotlight password',
    text: `Hi ${firstName ?? 'there'},\n\nClick this link to reset your password: ${resetLink}\n\nIf you did not request this, you can ignore this message.`,
  })
}
