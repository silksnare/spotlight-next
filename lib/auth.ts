import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  const [salt, storedHash] = passwordHash.split(':')
  if (!salt || !storedHash) return false

  const attemptedHash = scryptSync(password, salt, 64)
  const stored = Buffer.from(storedHash, 'hex')

  if (attemptedHash.length !== stored.length) return false
  return timingSafeEqual(attemptedHash, stored)
}
