type Input = { to: string; subject: string; text: string };

export async function sendEmail({ to, subject, text }: Input) {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    console.info(`[dev-email] to=${to} subject=${subject} body=${text}`);
    return;
  }
  if (process.env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, text }),
    });
    if (!res.ok) throw new Error(`Resend failed: ${res.status}`);
    return;
  }
  console.info(`[dev-email fallback] to=${to} subject=${subject} body=${text}`);
}
