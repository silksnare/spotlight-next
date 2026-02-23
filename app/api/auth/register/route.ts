import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { generateTokenPair } from '@/lib/tokens'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      const existingUserResult = await client.query(
        `SELECT id, email, first_name, email_verified_at
         FROM users
         WHERE email = $1
         FOR UPDATE`,
        [email],
      )

      let userId: number
      let userEmail: string
      let userFirstName: string | null

      if (existingUserResult.rowCount) {
        const existingUser = existingUserResult.rows[0]

        if (existingUser.email_verified_at) {
          await client.query('ROLLBACK')
          return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
        }

        const updatedUserResult = await client.query(
          `UPDATE users
           SET password_hash = $1,
               first_name = $2,
               last_name = $3,
               updated_at = now(),
               email_verified_at = NULL
           WHERE id = $4
           RETURNING id, email, first_name`,
          [hashPassword(password), firstName ?? null, lastName ?? null, existingUser.id],
        )

        userId = updatedUserResult.rows[0].id
        userEmail = updatedUserResult.rows[0].email
        userFirstName = updatedUserResult.rows[0].first_name
      } else {
        const insertedUserResult = await client.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, status)
           VALUES ($1, $2, $3, $4, 'active')
           RETURNING id, email, first_name`,
          [email, hashPassword(password), firstName ?? null, lastName ?? null],
        )

        userId = insertedUserResult.rows[0].id
        userEmail = insertedUserResult.rows[0].email
        userFirstName = insertedUserResult.rows[0].first_name
      }

      const { urlToken, code, tokenHash } = generateTokenPair()

      await client.query(
        `INSERT INTO email_verification_tokens (email, user_id, token_hash, expires_at)
         VALUES ($1, $2, $3, now() + interval '30 minutes')
         ON CONFLICT (email) WHERE used_at IS NULL
         DO UPDATE SET token_hash = EXCLUDED.token_hash, expires_at = EXCLUDED.expires_at, created_at = now(), user_id = EXCLUDED.user_id`,
        [userEmail, userId, tokenHash],
      )

      await client.query('COMMIT')

      await sendVerificationEmail(userEmail, userFirstName, urlToken, code)

      return NextResponse.json({ message: 'Registration successful. Check your email for verification details.' })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('register error', error)
    return NextResponse.json({ error: 'Unable to register.' }, { status: 500 })
  }
}
