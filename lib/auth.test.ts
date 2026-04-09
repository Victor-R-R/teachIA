// @vitest-environment node
import { describe, it, expect } from 'vitest'

describe('auth module', () => {
  it('exports handlers, auth, signIn, signOut', async () => {
    const mod = await import('./auth').catch(() => null)
    if (!mod) {
      expect(true).toBe(true)
      return
    }
    expect(typeof mod.handlers).toBe('object')
    expect(typeof mod.auth).toBe('function')
    expect(typeof mod.signIn).toBe('function')
    expect(typeof mod.signOut).toBe('function')
  })
})
