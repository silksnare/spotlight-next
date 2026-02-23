import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { generateTokenPair, hashToken } from '@/lib/tokens'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const userResult = await pool.query(
      `SELECT id, email, first_name
       FROM users
       WHERE email = $1 AND status = 'active'`,
      [email],
    )

    if (!userResult.rowCount) {
      return NextResponse.json({ message: 'If your email exists, reset instructions were sent.' })
    }

    const user = userResult.rows[0]
    const { urlToken } = generateTokenPair()
    const tokenHash = hashToken(urlToken)

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, request_ip, user_agent)
       VALUES ($1, $2, now() + interval '30 minutes', $3, $4)
       ON CONFLICT (user_id) WHERE used_at IS NULL
       DO UPDATE SET token_hash = EXCLUDED.token_hash, expires_at = EXCLUDED.expires_at, created_at = now(), request_ip = EXCLUDED.request_ip, user_agent = EXCLUDED.user_agent`,
      [
        user.id,
        tokenHash,
        req.headers.get('x-forwarded-for') ?? null,
        req.headers.get('user-agent') ?? null,
      ],
    )

    await sendPasswordResetEmail(user.email, user.first_name, urlToken)

    return NextResponse.json({ message: 'If your email exists, reset instructions were sent.' })
  } catch (error) {
    console.error('forgot password error', error)
    return NextResponse.json({ error: 'Unable to process forgot password request.' }, { status: 500 })
  }
}
