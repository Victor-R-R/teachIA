import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { neon } from '@neondatabase/serverless'

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })

const sql = neon(process.env.DATABASE_URL!)

const DOMAIN_LABELS: Record<string, string> = {
  langue:       'Langue espagnole (grammaire, lexique, phonologie)',
  civi_espagne: 'Civilisation espagnole',
  civi_latam:   'Civilisation latino-américaine',
  didactique:   'Didactique du FLE / espagnol',
}

const LEVEL_LABELS: Record<string, string> = {
  A: 'débutant (niveau A)',
  B: 'intermédiaire (niveau B)',
  C: 'avancé (niveau C)',
}

async function generateLesson(exerciseTitle: string, domain: string, level: string) {
  const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    maxOutputTokens: 4096,
    system: `Tu es un expert du CAPES d'espagnol et un pédagogue expérimenté. Tu rédiges des leçons claires, structurées et didactiques pour des candidats au CAPES d'espagnol.

Structure la leçon avec des sections en markdown (## pour les titres principaux, ### pour les sous-titres, - pour les listes).
Utilise les emojis : 🇪🇸 Espagne | 🌎 Latam | 📝 Langue | 🎓 Didactique | ⚠️ Piège | ✅ Bonne pratique | 💡 Astuce | *italique pour les exemples en espagnol*

Réponds UNIQUEMENT avec ce format exact, sans rien d'autre :
TITRE: <titre de la leçon>
---
<contenu markdown de la leçon>`,
    prompt: `Génère une leçon pédagogique sur le thème "${exerciseTitle}" dans le domaine "${DOMAIN_LABELS[domain]}" pour un apprenant de niveau ${LEVEL_LABELS[level]}.

La leçon doit :
- Commencer par une introduction courte (2-3 phrases)
- Présenter les concepts clés avec des exemples en espagnol (entre *astérisques*)
- Inclure des astuces mémorables (💡) et les pièges courants (⚠️)
- Terminer par un résumé (✅)
- Faire entre 400 et 600 mots. Format markdown uniquement.`,
  })

  const separatorIndex = text.indexOf('\n---\n')
  if (separatorIndex === -1) throw new Error('Unexpected model response format')

  const title = text.slice(0, separatorIndex).replace(/^TITRE:\s*/i, '').trim()
  const content = text.slice(separatorIndex + 5).trim()

  return { title, content }
}

export async function POST() {
  const session = await getSession()
  if (session.user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const exercises = await sql.query(`
    SELECT DISTINCT title, domain, level, array_agg(id) AS ids
    FROM exercises
    WHERE user_id IS NULL AND title IS NOT NULL
    GROUP BY title, domain, level
    ORDER BY domain, level, title
  `) as { title: string; domain: string; level: string; ids: number[] }[]

  const results: { title: string; status: 'created' | 'skipped' | 'error'; error?: string }[] = []

  for (const ex of exercises) {
    const existing = await sql.query(
      'SELECT id FROM lessons WHERE title = $1 AND user_id IS NULL',
      [ex.title]
    ) as { id: number }[]

    if (existing.length > 0) {
      results.push({ title: ex.title, status: 'skipped' })
      continue
    }

    try {
      const lesson = await generateLesson(ex.title, ex.domain, ex.level)

      const inserted = await sql.query(
        'INSERT INTO lessons (title, content, domain, level, user_id) VALUES ($1, $2, $3, $4, NULL) RETURNING id',
        [lesson.title, lesson.content, ex.domain, ex.level]
      ) as { id: number }[]

      const lessonId = inserted[0].id

      await sql.query(
        'UPDATE exercises SET lesson_id = $1 WHERE id = ANY($2::int[])',
        [lessonId, ex.ids]
      )

      results.push({ title: lesson.title, status: 'created' })
    } catch (err) {
      results.push({ title: ex.title, status: 'error', error: String(err) })
    }
  }

  const created = results.filter(r => r.status === 'created').length
  const skipped = results.filter(r => r.status === 'skipped').length
  const errors  = results.filter(r => r.status === 'error').length

  return NextResponse.json({ created, skipped, errors, results })
}
