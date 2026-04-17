import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })
const sql = neon(process.env.DATABASE_URL!)

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

const LESSON_IDS = [5, 9, 11, 13]

async function regenerateLesson(id: number, title: string, domain: string, level: string) {
  console.log(`\n→ Régénération leçon #${id}: "${title}"`)

  const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    maxOutputTokens: 4096,
    system: `Tu es un expert du CAPES d'espagnol et un pédagogue expérimenté. Tu rédiges des leçons claires, structurées et didactiques pour des candidats au CAPES d'espagnol.

Structure la leçon avec des sections en markdown (## pour les titres principaux, ### pour les sous-titres, - pour les listes).
Utilise les emojis : 🇪🇸 Espagne | 🌎 Latam | 📝 Langue | 🎓 Didactique | ⚠️ Piège | ✅ Bonne pratique | 💡 Astuce | *italique pour les exemples en espagnol*

Génère UNIQUEMENT le contenu markdown de la leçon, sans titre en première ligne (le titre est déjà connu). Commence directement par l'introduction.`,
    prompt: `Génère une leçon pédagogique sur le thème "${title}" dans le domaine "${DOMAIN_LABELS[domain]}" pour un apprenant de niveau ${LEVEL_LABELS[level]}.

La leçon doit :
- Commencer par une introduction courte (2-3 phrases)
- Présenter les concepts clés avec des exemples en espagnol (entre *astérisques*)
- Inclure des astuces mémorables (💡) et les pièges courants (⚠️)
- Terminer par un résumé (✅)
- Faire entre 400 et 600 mots. Format markdown uniquement.`,
  })

  await sql.query('UPDATE lessons SET content = $1 WHERE id = $2', [text, id])

  console.log(`  ✅ OK — ${text.length} chars`)
  console.log(`  Fin: ...${text.slice(-60).replace(/\n/g, ' ')}`)
}

async function run() {
  const lessons = await sql.query(
    `SELECT id, title, domain, level FROM lessons WHERE id = ANY($1::int[])`,
    [LESSON_IDS]
  ) as { id: number; title: string; domain: string; level: string }[]

  console.log(`Leçons à régénérer : ${lessons.length}`)

  for (const lesson of lessons) {
    try {
      await regenerateLesson(lesson.id, lesson.title, lesson.domain, lesson.level)
    } catch (err) {
      console.error(`  ❌ Erreur leçon #${lesson.id}:`, err)
    }
  }

  console.log('\nTerminé.')
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
