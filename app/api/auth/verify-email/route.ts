import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { hashCompositeToken } from '@/lib/tokens'

export async function POST(req: Request) {
  try {
    const { email, token, code } = await req.json()

    if (!email || !token || !code) {
      return NextResponse.json({ error: 'Email, token, and code are required.' }, { status: 400 })
    }

    const tokenHash = hashCompositeToken(token, code)

    const result = await pool.query(
      `UPDATE email_verification_tokens
       SET used_at = now()
       WHERE email = $1
         AND token_hash = $2
         AND used_at IS NULL
         AND expires_at > now()
       RETURNING user_id`,
      [email, tokenHash],
    )

    if (!result.rowCount) {
      return NextResponse.json({ error: 'Invalid or expired verification details.' }, { status: 400 })
    }

    await pool.query(
      `UPDATE users
       SET email_verified_at = now(), updated_at = now()
       WHERE id = $1`,
      [result.rows[0].user_id],
    )

    return NextResponse.json({ message: 'Email verified. You can now log in.' })
  } catch (error) {
    console.error('verify email error', error)
    return NextResponse.json({ error: 'Unable to verify email.' }, { status: 500 })
  }
}
