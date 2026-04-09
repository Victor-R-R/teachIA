import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/session'

export async function POST() {
  const session = await getSession()
  if (session.user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const cookieStore = await cookies()
  cookieStore.delete('impersonate_user_id')
  cookieStore.delete('impersonate_user_email')

  return NextResponse.json({ ok: true })
}
