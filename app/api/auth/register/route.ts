import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool, { ensureSchema } from '@/lib/db';
import { generateToken, hashToken, getTokenExpiry } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();

    const body = await request.json();
    const { email, password, confirmPassword, firstName, lastName } = body;

    // --- validation ---
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // --- check existing ---
    const existing = await pool.query(
      'SELECT id, email_verified_at FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      const user = existing.rows[0];

      if (!user.email_verified_at) {
        // Account exists but unverified — resend verification
        await pool.query(
          'DELETE FROM email_verification_tokens WHERE email = $1 AND used_at IS NULL',
          [email]
        );

        const rawToken = generateToken();
        const tokenHash = hashToken(rawToken);
        const expiresAt = getTokenExpiry(24);

        await pool.query(
          `INSERT INTO email_verification_tokens (email, user_id, token_hash, expires_at)
           VALUES ($1, $2, $3, $4)`,
          [email, user.id, tokenHash, expiresAt]
        );

        await sendVerificationEmail(email, rawToken, firstName);

        return NextResponse.json({
          message: 'A new verification email has been sent. Please check your inbox.',
        });
      }

      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // --- create user ---
    const passwordHash = await bcrypt.hash(password, 12);

    const insertResult = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [email, passwordHash, firstName.trim(), lastName.trim()]
    );

    const userId: number = insertResult.rows[0].id;

    // --- create email verification token ---
    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = getTokenExpiry(24);

    await pool.query(
      `INSERT INTO email_verification_tokens (email, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [email, userId, tokenHash, expiresAt]
    );

    // --- send verification email ---
    await sendVerificationEmail(email, rawToken, firstName.trim());

    return NextResponse.json(
      {
        message:
          'Registration successful! Please check your email and click the verification link to activate your account.',
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/auth/register]', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
