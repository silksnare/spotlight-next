import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'strongmail2.biperf.com',
  port: parseInt(process.env.SMTP_PORT || '25'),
  secure: false, // plain SMTP on port 25 (STARTTLS upgrade if offered)
  tls: {
    rejectUnauthorized: false, // allow self-signed certificates
  },
});

const FROM = process.env.SMTP_FROM || 'noreply@spotlight.com';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export async function sendVerificationEmail(
  email: string,
  token: string,
  firstName: string
): Promise<void> {
  const verifyUrl = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Verify your Spotlight account',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#111">Welcome to Spotlight, ${firstName}!</h2>
        <p style="color:#444">
          Thanks for registering. Please verify your email address to activate your account.
        </p>
        <a href="${verifyUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 28px;background:#000;color:#fff;
                  text-decoration:none;border-radius:24px;font-weight:600;letter-spacing:.05em">
          Verify Email Address
        </a>
        <p style="color:#666;font-size:13px">
          Or copy this link into your browser:<br>
          <a href="${verifyUrl}" style="color:#555">${verifyUrl}</a>
        </p>
        <p style="color:#888;font-size:12px">This link expires in 24 hours. If you did not create an account, you can safely ignore this email.</p>
      </div>
    `,
    text: `Welcome to Spotlight, ${firstName}!\n\nVerify your email: ${verifyUrl}\n\nThis link expires in 24 hours.`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Reset your Spotlight password',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#111">Password Reset Request</h2>
        <p style="color:#444">
          We received a request to reset your Spotlight password.
          Click the button below to choose a new password.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 28px;background:#000;color:#fff;
                  text-decoration:none;border-radius:24px;font-weight:600;letter-spacing:.05em">
          Reset Password
        </a>
        <p style="color:#666;font-size:13px">
          Or copy this link into your browser:<br>
          <a href="${resetUrl}" style="color:#555">${resetUrl}</a>
        </p>
        <p style="color:#888;font-size:12px">This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `,
    text: `Reset your Spotlight password:\n\n${resetUrl}\n\nThis link expires in 1 hour.`,
  });
}
