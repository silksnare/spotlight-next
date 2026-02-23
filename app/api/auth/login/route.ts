import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool, { ensureSchema } from '@/lib/db';
import {
  createSessionToken,
  SESSION_COOKIE_OPTIONS,
  COOKIE_NAME,
} from '@/lib/session';

const MAX_ATTEMPTS = 3;

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Fetch user (select failed_login_attempts added by our migration)
    const result = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name,
              status, email_verified_at, failed_login_attempts
       FROM users
       WHERE email = $1`,
      [email]
    );

    // Generic message prevents email enumeration
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Disabled account
    if (user.status === 'disabled') {
      return NextResponse.json(
        {
          error:
            'Your account has been disabled due to too many failed login attempts. Please contact support to regain access.',
        },
        { status: 403 }
      );
    }

    // Verify password
    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      const newAttempts: number = (user.failed_login_attempts ?? 0) + 1;

      if (newAttempts >= MAX_ATTEMPTS) {
        // Lock the account
        await pool.query(
          `UPDATE users
           SET status = 'disabled', failed_login_attempts = $1, updated_at = NOW()
           WHERE id = $2`,
          [newAttempts, user.id]
        );
        return NextResponse.json(
          {
            error:
              'Your account has been disabled after 3 failed login attempts. Please contact support to regain access.',
          },
          { status: 403 }
        );
      }

      // Increment counter
      await pool.query(
        `UPDATE users SET failed_login_attempts = $1, updated_at = NOW() WHERE id = $2`,
        [newAttempts, user.id]
      );

      const remaining = MAX_ATTEMPTS - newAttempts;
      return NextResponse.json(
        {
          error: `Invalid email or password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before your account is locked.`,
        },
        { status: 401 }
      );
    }

    // Password correct — now check email verification
    if (!user.email_verified_at) {
      return NextResponse.json(
        {
          error:
            'Please verify your email address before signing in. Check your inbox for the verification link.',
        },
        { status: 403 }
      );
    }

    // Reset failed attempts on successful login
    await pool.query(
      `UPDATE users SET failed_login_attempts = 0, updated_at = NOW() WHERE id = $1`,
      [user.id]
    );

    // Create JWT session
    const sessionUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    };

    const token = await createSessionToken(sessionUser);

    const response = NextResponse.json({
      message: 'Login successful.',
      user: sessionUser,
    });

    response.cookies.set(COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

    return response;
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
