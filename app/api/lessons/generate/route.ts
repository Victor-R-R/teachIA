import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { z } from 'zod'

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })

const DOMAIN_LABELS: Record<string, string> = {
  langue: 'Langue espagnole (grammaire, lexique, phonologie)',
  civi_espagne: 'Civilisation espagnole',
  civi_latam: 'Civilisation latino-américaine',
  didactique: 'Didactique du FLE / espagnol',
}

const LEVEL_LABELS: Record<string, string> = {
  A: 'débutant (niveau A)',
  B: 'intermédiaire (niveau B)',
  C: 'avancé (niveau C)',
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

  const RequestSchema = z.object({
    domain: z.enum(['langue', 'civi_espagne', 'civi_latam', 'didactique']),
    level: z.enum(['A', 'B', 'C']),
    title: z.string().optional(),
  })

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { domain, level, title } = parsed.data

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      maxOutputTokens: 4096,
      system: `Tu es un expert du CAPES d'espagnol et un pédagogue expérimenté. Tu rédiges des leçons claires, structurées et didactiques pour des candidats au CAPES d'espagnol.

Utilise les emojis thématiques dans tes leçons pour les rendre plus visuelles et mémorables.
Structure la leçon avec des sections en markdown (## pour les titres principaux, ### pour les sous-titres, - pour les listes).
Inclus toujours : une introduction, les règles essentielles avec exemples en espagnol en *italique*, et les pièges à éviter avec ⚠️.

Emojis par domaine :
🇪🇸 Civilisation espagnole | 🌎 Amér. latine | 📝 Langue/Grammaire | 🎓 Didactique
⚠️ Piège | ✅ Bonne pratique | ❌ Erreur | 💡 Astuce | 🎯 Point clé

Réponds UNIQUEMENT avec ce format exact, sans rien d'autre :
TITRE: <titre de la leçon>
---
<contenu markdown de la leçon>`,
      prompt: `Génère une leçon pédagogique sur le domaine "${DOMAIN_LABELS[domain]}" pour un apprenant de niveau ${LEVEL_LABELS[level]}.${title ? ` Le titre proposé est : "${title}".` : ''}

La leçon doit :
- Commencer par une introduction courte et accrocheuse (2-3 phrases)
- Présenter les concepts clés avec des exemples concrets en espagnol (entre *astérisques*)
- Inclure des règles mnémotechniques ou des astuces mémorables (💡)
- Signaler clairement les pièges et erreurs fréquentes (⚠️)
- Terminer par un résumé des points clés (✅)
- Être adaptée au niveau ${level} : ${LEVEL_LABELS[level]}
- Faire entre 400 et 600 mots

Format markdown uniquement. Utilise ## pour les sections principales.`,
    })

    const separatorIndex = text.indexOf('\n---\n')
    if (separatorIndex === -1) {
      return NextResponse.json({ error: 'Unexpected model response format' }, { status: 500 })
    }

    const titleLine = text.slice(0, separatorIndex).replace(/^TITRE:\s*/i, '').trim()
    const content = text.slice(separatorIndex + 5).trim()

    return NextResponse.json({ title: titleLine, content })
  } catch {
    return NextResponse.json({ error: 'Failed to generate lesson' }, { status: 500 })
  }
}
