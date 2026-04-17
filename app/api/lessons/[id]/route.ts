import { NextRequest, NextResponse } from 'next/server'
import { getLessonById, updateLesson, deleteLesson, setLessonExercises, getLessonOwner } from '@/lib/db'
import { getSession } from '@/lib/session'
import { z } from 'zod'

async function canEdit(lessonId: number, userId: string, role: string): Promise<boolean> {
  if (role === 'superadmin') return true
  const ownerId = await getLessonOwner(lessonId)
  return ownerId === userId
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lesson = await getLessonById(Number(id))
  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(lesson)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!(await canEdit(Number(id), session.user.id, session.user.role ?? ''))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const Schema = z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    exercise_ids: z.array(z.number()).optional(),
  })

  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { exercise_ids, ...lessonData } = parsed.data
  await updateLesson(Number(id), lessonData)
  if (exercise_ids !== undefined) {
    await setLessonExercises(Number(id), exercise_ids)
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!(await canEdit(Number(id), session.user.id, session.user.role ?? ''))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await deleteLesson(Number(id))
  return NextResponse.json({ ok: true })
}
