type MailPayload = {
  from: string
  to: string
  subject: string
  text: string
}

async function sendMail(payload: MailPayload) {
  const webhookUrl = process.env.MAIL_WEBHOOK_URL

  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Mail webhook returned HTTP ${response.status}`)
    }

    return
  }

  console.info('[mail] MAIL_WEBHOOK_URL is not configured; email delivery skipped.', payload)
}

const fromAddress = process.env.MAIL_FROM ?? 'no-reply@spotlight.local'
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function sendVerificationEmail(email: string, firstName: string | null, urlToken: string, code: string) {
  const verifyLink = `${appUrl}/verify-email?token=${encodeURIComponent(urlToken)}&email=${encodeURIComponent(email)}`

  await sendMail({
    from: fromAddress,
    to: email,
    subject: 'Verify your Spotlight account',
    text: `Hi ${firstName ?? 'there'},\n\nUse this code to verify your account: ${code}\n\nOr click this link: ${verifyLink}\n\nIf you did not create this account, ignore this message.`,
  })
}

export async function sendPasswordResetEmail(email: string, firstName: string | null, urlToken: string) {
  const resetLink = `${appUrl}/reset-password?token=${encodeURIComponent(urlToken)}`

  await sendMail({
    from: fromAddress,
    to: email,
    subject: 'Reset your Spotlight password',
    text: `Hi ${firstName ?? 'there'},\n\nClick this link to reset your password: ${resetLink}\n\nIf you did not request this, you can ignore this message.`,
  })
}
