# Spotlight

A secure, web-based video competition platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **Email**: SMTP (strongmail2.biperf.com:25)

## Authentication Flow Implemented

- Registration with `first_name`, `last_name`, `email`, and password.
- Verification email with:
  - verification link back to `/verify-email`
  - verification code (must be entered on verification page)
- Login blocked until email is verified.
- Password reset flow (`/forgot-password` -> email link -> `/reset-password`).
- Automatic account disable after **3 consecutive failed password attempts**.

## Environment Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in the password/secrets values.
3. Install dependencies and run:

```bash
npm install
npm run dev
```

## Database Notes

This implementation uses your existing tables and also creates this support table automatically if missing:

- `login_failures` (`user_id`, `failed_attempts`, `updated_at`)

The table is used to track consecutive failed login attempts and disable accounts after 3 failures.
