import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createUserProfile } from '@/lib/db'

const Schema = z.object({
  level_langue: z.enum(['A', 'B', 'C']),
  level_civi: z.enum(['A', 'B', 'C']),
  level_didactique: z.enum(['A', 'B', 'C']),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  try {
    await createUserProfile(parsed.data)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('onboarding/save error:', err)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}
