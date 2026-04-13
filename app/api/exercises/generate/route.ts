import { generateText, Output } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { saveExercise } from '@/lib/db'
import { getEffectiveUserId } from '@/lib/session'
import { z } from 'zod'

const ExerciseSchema = z.object({
  theme: z.string(),
  domain: z.enum(['langue', 'civi_espagne', 'civi_latam', 'didactique']),
  type: z.enum(['qcm', 'vrai_faux', 'lacunaire']),
  question: z.string(),
  options: z.array(z.string()).nullable(),
  answer: z.string(),
  explanation: z.string(),
  level: z.enum(['A', 'B', 'C']),
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
    type: z.enum(['qcm', 'vrai_faux', 'lacunaire']),
    level: z.enum(['A', 'B', 'C']),
  })

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  const { theme, domain, type, level } = parsed.data

  try {
    const userId = await getEffectiveUserId()
    const { output } = await generateText({
      model: 'anthropic/claude-sonnet-4.6',
      output: Output.object({ schema: ExerciseSchema }),
      system: `Tu es un expert du CAPES d'espagnol. Tu génères des exercices rigoureux, culturellement précis et pédagogiquement pertinents pour des candidats préparant le concours.

Pour le champ "explanation", structure ta réponse ainsi :
- Commence par la règle ou le concept clé (en **gras** pour les termes importants)
- Ajoute un exemple illustratif si pertinent (en *italique* pour les exemples en espagnol)
- Termine par un piège à éviter ou une nuance importante (⚠️)`,
      prompt: `Génère un exercice de type "${type}" sur le thème "${theme}" dans le domaine "${domain}" pour un candidat de niveau "${level}".

Pour un QCM : 4 options dont une seule correcte.
Pour un vrai/faux : une affirmation avec réponse "Vrai" ou "Faux".
Pour un lacunaire : une phrase avec "___" pour le mot manquant.

L'explication doit être pédagogique (2-3 phrases), jamais condescendante.`,
    })

    const saved = await saveExercise(userId, { ...output, source: 'ai_generated', title: null, questions: null })
    return NextResponse.json(saved)
  } catch {
    return NextResponse.json({ error: 'Failed to generate exercise' }, { status: 500 })
  }
}
