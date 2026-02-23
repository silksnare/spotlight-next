import { NextResponse } from 'next/server'
import { pool, ensureAuthSupportTables } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    await ensureAuthSupportTables()

    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    const userResult = await pool.query(
      `SELECT id, email, password_hash, status, email_verified_at
       FROM users
       WHERE email = $1`,
      [email],
    )

    const user = userResult.rows[0]

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

    if (user.status === 'disabled') {
      return NextResponse.json({ error: 'Account disabled. Contact support.' }, { status: 403 })
    }

    if (!user.email_verified_at) {
      return NextResponse.json({ error: 'Please verify your email before logging in.' }, { status: 403 })
    }

    if (!verifyPassword(password, user.password_hash)) {
      const failResult = await pool.query(
        `INSERT INTO login_failures (user_id, failed_attempts, updated_at)
         VALUES ($1, 1, now())
         ON CONFLICT (user_id)
         DO UPDATE SET failed_attempts = login_failures.failed_attempts + 1, updated_at = now()
         RETURNING failed_attempts`,
        [user.id],
      )

      const failedAttempts = failResult.rows[0]?.failed_attempts ?? 1
      if (failedAttempts >= 3) {
        await pool.query(`UPDATE users SET status = 'disabled', updated_at = now() WHERE id = $1`, [user.id])
        await pool.query(`DELETE FROM login_failures WHERE user_id = $1`, [user.id])
        return NextResponse.json({ error: 'Account disabled after 3 failed login attempts.' }, { status: 403 })
      }

      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

    await pool.query(`DELETE FROM login_failures WHERE user_id = $1`, [user.id])

    return NextResponse.json({ message: 'Login successful.', user: { id: user.id, email: user.email } })
  } catch (error) {
    console.error('login error', error)
    return NextResponse.json({ error: 'Unable to log in.' }, { status: 500 })
  }
}
