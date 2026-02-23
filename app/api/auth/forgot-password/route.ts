import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateToken, hashToken, getTokenExpiry } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

// Always returns the same message to prevent email enumeration
const SUCCESS_MSG =
  'If an account with that email exists, a password reset link has been sent. Please check your inbox.';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // Look up an active (non-disabled) user
    const result = await pool.query(
      `SELECT id FROM users WHERE email = $1 AND status = 'active' AND email_verified_at IS NOT NULL`,
      [email]
    );

    if (result.rows.length > 0) {
      const userId: number = result.rows[0].id;

      // Remove any existing unused reset token (unique index enforces one at a time)
      await pool.query(
        'DELETE FROM password_reset_tokens WHERE user_id = $1 AND used_at IS NULL',
        [userId]
      );

      const rawToken = generateToken();
      const tokenHash = hashToken(rawToken);
      const expiresAt = getTokenExpiry(1); // 1-hour window

      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        null;
      const userAgent = request.headers.get('user-agent') || null;

      await pool.query(
        `INSERT INTO password_reset_tokens
           (user_id, token_hash, expires_at, request_ip, user_agent)
         VALUES ($1, $2, $3, $4::inet, $5)`,
        [userId, tokenHash, expiresAt, ip, userAgent]
      );

      await sendPasswordResetEmail(email, rawToken);
    }

    // Always succeed — don't reveal whether the email exists
    return NextResponse.json({ message: SUCCESS_MSG });
  } catch (err) {
    console.error('[POST /api/auth/forgot-password]', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
