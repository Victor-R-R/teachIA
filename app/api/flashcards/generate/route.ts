import { generateText, Output } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { saveFlashcard } from '@/lib/db'
import { getEffectiveUserId } from '@/lib/session'
import { z } from 'zod'

const FlashcardSchema = z.object({
  front: z.string(),
  back: z.string(),
  domain: z.enum(['langue', 'civi_espagne', 'civi_latam', 'didactique']),
  level: z.enum(['A', 'B', 'C']),
})

const BatchSchema = z.object({
  cards: z.array(FlashcardSchema).min(1).max(10),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const RequestSchema = z.object({
    theme: z.string().min(1),
    domain: z.enum(['langue', 'civi_espagne', 'civi_latam', 'didactique']),
    level: z.enum(['A', 'B', 'C']),
    count: z.number().int().min(1).max(10).default(5),
  })

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  const { theme, domain, level, count } = parsed.data

  const DOMAIN_LABELS: Record<string, string> = {
    langue: 'Langue (grammaire, linguistique, traduction)',
    civi_espagne: 'Civilisation espagnole (histoire, arts, littérature)',
    civi_latam: 'Civilisation latino-américaine (histoire, arts, littérature)',
    didactique: 'Didactique des langues (CECRL, méthodes, pédagogie)',
  }

  try {
    const userId = await getEffectiveUserId()
    const { output } = await generateText({
      model: 'anthropic/claude-sonnet-4.6',
      output: Output.object({ schema: BatchSchema }),
      system: `Tu es un expert du CAPES d'espagnol. Tu crées des flashcards pédagogiques rigoureuses pour des candidats au concours. Chaque flashcard doit être précise, synthétique et utile pour la mémorisation active.`,
      prompt: `Génère exactement ${count} flashcards sur le thème "${theme}" dans le domaine "${DOMAIN_LABELS[domain]}" pour un niveau CAPES "${level}".

Règles :
- RECTO (front) : une notion, un terme, une question courte et précise (max 15 mots)
- VERSO (back) : la définition ou réponse, synthétique et complète (3-6 lignes max)
- Les cartes doivent être distinctes et complémentaires
- Niveau A = notions fondamentales, B = intermédiaire, C = expert/concours

Renvoie exactement ${count} cartes dans le tableau "cards".`,
    })

    const saved = await Promise.all(
      output.cards.map(card =>
        saveFlashcard(userId, { ...card, source: 'ai_generated' })
      )
    )

    return NextResponse.json(saved)
  } catch {
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 })
  }
}
