import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email } = body;

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required.' },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(token);

    // Find a matching, unused, non-expired token
    const result = await pool.query(
      `SELECT id, user_id
       FROM email_verification_tokens
       WHERE email      = $1
         AND token_hash = $2
         AND used_at   IS NULL
         AND expires_at > NOW()`,
      [email, tokenHash]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          error:
            'This verification link is invalid or has expired. Please register again to receive a new link.',
        },
        { status: 400 }
      );
    }

    const { id: tokenId, user_id: userId } = result.rows[0];

    // Mark token used and verify user in one transaction
    await pool.query('BEGIN');
    try {
      await pool.query(
        'UPDATE email_verification_tokens SET used_at = NOW() WHERE id = $1',
        [tokenId]
      );
      await pool.query(
        'UPDATE users SET email_verified_at = NOW(), updated_at = NOW() WHERE id = $1',
        [userId]
      );
      await pool.query('COMMIT');
    } catch (txErr) {
      await pool.query('ROLLBACK');
      throw txErr;
    }

    return NextResponse.json({
      message: 'Email verified successfully! You can now sign in.',
    });
  } catch (err) {
    console.error('[POST /api/auth/verify-email]', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
