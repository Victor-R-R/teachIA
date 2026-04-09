// lib/session.ts
import { auth } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Session } from 'next-auth'

export type AppSession = Session & {
  user: Session['user'] & { id: string; role: 'student' | 'superadmin' }
}

/**
 * Returns the effective user ID for the current request.
 * If the superadmin has activated impersonation, returns the impersonated user's ID.
 * Redirects to /login if not authenticated.
 */
export async function getEffectiveUserId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  if ((session as AppSession).user.role === 'superadmin') {
    const cookieStore = await cookies()
    const impersonated = cookieStore.get('impersonate_user_id')
    if (impersonated?.value) return impersonated.value
  }

  return session.user.id
}

/**
 * Returns the full session, redirecting to /login if absent.
 */
export async function getSession(): Promise<AppSession> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return session as AppSession
}
