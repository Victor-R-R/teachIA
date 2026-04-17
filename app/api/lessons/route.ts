import { NextRequest, NextResponse } from 'next/server'
import { createLesson, getLessons } from '@/lib/db'
import { getSession } from '@/lib/session'
import { z } from 'zod'

export async function GET() {
  const lessons = await getLessons()
  return NextResponse.json(lessons)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const Schema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    domain: z.enum(['langue', 'civi_espagne', 'civi_latam', 'didactique']),
    level: z.enum(['A', 'B', 'C']),
  })

  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Superadmin → leçon catalogue (user_id = null), utilisateur → leçon personnelle
  const userId = session.user.role === 'superadmin' ? null : session.user.id

  const lesson = await createLesson({ ...parsed.data, userId })
  return NextResponse.json(lesson)
}
