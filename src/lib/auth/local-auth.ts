import { pbkdf2Sync, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import validator from 'validator';

export const CODE_EXPIRY_MS = 10 * 60 * 1000;
export const CODE_RESEND_COOLDOWN_MS = 60 * 1000;
const ITERATIONS = 210000;

export function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
export function isValidEmail(email: string) { return validator.isEmail(email); }
export function isStrongPassword(password: string) { return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password); }
export function generateSixDigitCode() { return String(randomInt(0, 1000000)).padStart(6, '0'); }

export async function hashValue(value: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(value, salt, ITERATIONS, 32, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}
export async function compareValue(value: string, stored: string) {
  const [salt, expected] = stored.split(':');
  if (!salt || !expected) return false;
  const actual = pbkdf2Sync(value, salt, ITERATIONS, 32, 'sha256');
  return timingSafeEqual(actual, Buffer.from(expected, 'hex'));
}
export function makeLocalEmployeeId() { return `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`; }
