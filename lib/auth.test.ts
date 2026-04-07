// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { createSession, validateSession } from './auth'

// auth.ts uses jose JWT with a secret from env
process.env.AUTH_SECRET = 'test-secret-32-characters-minimum!!'

describe('auth helpers', () => {
  it('createSession returns a JWT string', async () => {
    const token = await createSession()
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
  })

  it('validateSession returns true for a valid token', async () => {
    const token = await createSession()
    const valid = await validateSession(token)
    expect(valid).toBe(true)
  })

  it('validateSession returns false for a garbage string', async () => {
    const valid = await validateSession('not-a-jwt')
    expect(valid).toBe(false)
  })

  it('validateSession returns false for empty string', async () => {
    const valid = await validateSession('')
    expect(valid).toBe(false)
  })

  it('validateSession returns false for an expired token', async () => {
    const { SignJWT } = await import('jose')
    const expired = await new SignJWT({ authorized: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('-1s')
      .sign(new TextEncoder().encode(process.env.AUTH_SECRET!))
    const valid = await validateSession(expired)
    expect(valid).toBe(false)
  })

  it('validateSession returns false for token with wrong secret', async () => {
    const { SignJWT } = await import('jose')
    const wrongSecret = new TextEncoder().encode('wrong-secret-32-characters-padded!!')
    const token = await new SignJWT({ authorized: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(wrongSecret)
    const valid = await validateSession(token)
    expect(valid).toBe(false)
  })
})
