import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { hashToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(token);

    // Find valid, unused, non-expired reset token
    const result = await pool.query(
      `SELECT id, user_id
       FROM password_reset_tokens
       WHERE token_hash = $1
         AND used_at   IS NULL
         AND expires_at > NOW()`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          error:
            'This reset link is invalid or has expired. Please request a new one.',
        },
        { status: 400 }
      );
    }

    const { id: tokenId, user_id: userId } = result.rows[0];
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password + reset lockout + mark token used (in a transaction)
    await pool.query('BEGIN');
    try {
      await pool.query(
        `UPDATE users
         SET password_hash          = $1,
             failed_login_attempts  = 0,
             status                 = 'active',
             updated_at             = NOW()
         WHERE id = $2`,
        [passwordHash, userId]
      );
      await pool.query(
        'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1',
        [tokenId]
      );
      await pool.query('COMMIT');
    } catch (txErr) {
      await pool.query('ROLLBACK');
      throw txErr;
    }

    return NextResponse.json({
      message: 'Password reset successfully! You can now sign in with your new password.',
    });
  } catch (err) {
    console.error('[POST /api/auth/reset-password]', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
