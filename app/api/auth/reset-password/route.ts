import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { hashToken } from '@/lib/tokens'
import { hashPassword } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 })
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const tokenHash = hashToken(token)

    const tokenResult = await pool.query(
      `UPDATE password_reset_tokens
       SET used_at = now()
       WHERE token_hash = $1
         AND used_at IS NULL
         AND expires_at > now()
       RETURNING user_id`,
      [tokenHash],
    )

    if (!tokenResult.rowCount) {
      return NextResponse.json({ error: 'Invalid or expired reset token.' }, { status: 400 })
    }

    await pool.query(
      `UPDATE users
       SET password_hash = $1, status = 'active', updated_at = now()
       WHERE id = $2`,
      [hashPassword(password), tokenResult.rows[0].user_id],
    )

    await pool.query(`DELETE FROM login_failures WHERE user_id = $1`, [tokenResult.rows[0].user_id])

    return NextResponse.json({ message: 'Password reset successful.' })
  } catch (error) {
    console.error('reset password error', error)
    return NextResponse.json({ error: 'Unable to reset password.' }, { status: 500 })
  }
}
