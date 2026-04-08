import { NextRequest, NextResponse } from 'next/server'
import { saveFlashcardReview } from '@/lib/db'
import { z } from 'zod'

const ReviewSchema = z.object({
  flashcard_id: z.number().int().positive(),
  known: z.boolean(),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = ReviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  try {
    await saveFlashcardReview(parsed.data.flashcard_id, parsed.data.known)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
  }
}
