import { randomBytes, createHash } from 'crypto';

/** Generates a cryptographically random 64-character hex token. */
export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

/** SHA-256 hash of a raw token — stored in the database. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Returns a Date that is `hours` hours from now. */
export function getTokenExpiry(hours: number): Date {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d;
}
