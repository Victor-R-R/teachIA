import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/session'

export async function POST(req: Request) {
  const session = await getSession()
  if (session.user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId, email } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const cookieStore = await cookies()
  cookieStore.set('impersonate_user_id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60, // 1 hour
    path: '/',
    sameSite: 'lax',
  })
  // Also store email for display in banner
  cookieStore.set('impersonate_user_email', email ?? '', {
    httpOnly: false, // readable by client for banner
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60,
    path: '/',
    sameSite: 'lax',
  })

  return NextResponse.json({ ok: true })
}
