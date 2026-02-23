import { createHash, randomBytes } from 'crypto'

export function generateTokenPair() {
  const urlToken = randomBytes(24).toString('hex')
  const code = randomBytes(3).toString('hex').toUpperCase()
  const composite = `${urlToken}:${code}`
  const tokenHash = createHash('sha256').update(composite).digest('hex')

  return { urlToken, code, tokenHash }
}

export function hashCompositeToken(urlToken: string, code: string) {
  return createHash('sha256').update(`${urlToken}:${code.trim().toUpperCase()}`).digest('hex')
}

export function hashToken(urlToken: string) {
  return createHash('sha256').update(urlToken).digest('hex')
}
