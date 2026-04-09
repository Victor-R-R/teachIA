// lib/session.test.ts
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`REDIRECT:${url}`) }),
}))

import { auth } from '@/lib/auth'
import { cookies } from 'next/headers'

describe('getEffectiveUserId', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns session user id for a regular student', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-123', role: 'student', email: 't@t.com', name: 'T', image: null },
      expires: '',
    } as unknown as Awaited<ReturnType<typeof auth>>)
    vi.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as Awaited<ReturnType<typeof cookies>>)

    vi.resetModules()
    const { getEffectiveUserId } = await import('./session')
    const id = await getEffectiveUserId()
    expect(id).toBe('user-123')
  })

  it('returns impersonated id for superadmin with impersonation cookie', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'superadmin', email: 'a@a.com', name: 'A', image: null },
      expires: '',
    } as unknown as Awaited<ReturnType<typeof auth>>)
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === 'impersonate_user_id' ? { name: 'impersonate_user_id', value: 'student-42' } : undefined,
    } as Awaited<ReturnType<typeof cookies>>)

    vi.resetModules()
    const { getEffectiveUserId } = await import('./session')
    const id = await getEffectiveUserId()
    expect(id).toBe('student-42')
  })

  it('redirects to /login when no session', async () => {
    vi.mocked(auth).mockResolvedValue(null as unknown as Awaited<ReturnType<typeof auth>>)
    vi.mocked(cookies).mockResolvedValue({ get: () => undefined } as Awaited<ReturnType<typeof cookies>>)

    vi.resetModules()
    const { getEffectiveUserId } = await import('./session')
    await expect(getEffectiveUserId()).rejects.toThrow('REDIRECT:/login')
  })
})
