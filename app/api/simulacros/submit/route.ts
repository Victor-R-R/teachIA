import { generateText, Output } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { NextRequest, NextResponse } from 'next/server'
import { getSimulacroById, saveSimulacroResponse, saveSimulacroFeedback, logStudyActivity } from '@/lib/db'
import { getEffectiveUserId } from '@/lib/session'
import { z } from 'zod'

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY })

const FeedbackSchema = z.object({
  score: z.number().min(0).max(20),
  appreciation: z.enum(['insuffisant', 'passable', 'assez_bien', 'bien', 'tres_bien']),
  langue: z.object({
    note: z.number().min(0).max(7),
    commentaire: z.string(),
    points_forts: z.array(z.string()),
    points_faibles: z.array(z.string()),
  }),
  methodologie: z.object({
    note: z.number().min(0).max(7),
    commentaire: z.string(),
    points_forts: z.array(z.string()),
    points_faibles: z.array(z.string()),
  }),
  contenu: z.object({
    note: z.number().min(0).max(6),
    commentaire: z.string(),
    points_forts: z.array(z.string()),
    points_faibles: z.array(z.string()),
  }),
  conseil_prioritaire: z.string(),
})

const EVAL_SYSTEM = `Tu es un correcteur expert du jury du CAPES d'espagnol (session 2025, présidente Christine Lavail). Tu évalues des copies avec la rigueur et la bienveillance attendues d'un correcteur de concours. Tu connais parfaitement les critères officiels : langue, méthodologie, contenu.

Dans tes commentaires (champs "commentaire", "points_forts", "points_faibles", "conseil_prioritaire") :
- Utilise le **gras** pour les points importants et les notions clés
- Utilise l'*italique* pour citer des passages de la copie ou des exemples en espagnol
- Sois encourageant sur les points forts, précis et constructif sur les points faibles
- Le conseil_prioritaire doit être actionnable et concret (une seule chose à travailler en priorité)`

function getEvalPrompt(type: string, subject: string, content: string): string {
  if (type === 'composition') {
    return `Évalue cette composition de CAPES d'espagnol.

SUJET :
${subject}

COPIE DU CANDIDAT :
${content}

Critères d'évaluation officiels (sur 20) :
- Langue (7 pts) : maîtrise de l'espagnol, conjugaisons, accentuation, syntaxe, vocabulaire, registre
- Méthodologie (7 pts) : présentation des docs, mise en relation, problématique claire et obligatoire, plan annoncé, développement progressif, transitions, citations analysées, conclusion
- Contenu (6 pts) : connaissance des œuvres au programme, culture hispanique, pertinence de l'analyse

Erreurs éliminatoires/lourdement sanctionnées selon le rapport du jury :
- Absence de problématique
- Absence de plan annoncé
- Langue défaillante (pour un futur enseignant d'espagnol c'est rédhibitoire)
- Paraphrase des documents
- Composition non achevée (sans conclusion)
- Plan séparant fond/forme ou un document par partie

Donne une évaluation structurée et pédagogique. Sois précis et juste.`
  }

  if (type === 'theme') {
    return `Évalue cette traduction (thème FR→ES) de CAPES d'espagnol.

SUJET :
${subject}

TRADUCTION DU CANDIDAT :
${content}

Critères d'évaluation pour le thème (sur 20) :
- Langue espagnole (8 pts) : conjugaisons, accentuation, ser/estar, syntaxe, vocabulaire, registre soutenu
- Fidélité sémantique (6 pts) : sens préservé, pas de contresens, pas d'omissions
- Qualité stylistique (6 pts) : adaptation des tournures idiomatiques, fluidité, registre

Erreurs lourdement sanctionnées : barbarismes lexicaux, calques grammaticaux, omissions, non-sens, accentuation absente ou fantaisiste.

Donne une évaluation structurée. Pour les erreurs, cite la phrase source et propose la traduction correcte.`
  }

  // version
  return `Évalue cette traduction (version ES→FR) de CAPES d'espagnol.

SUJET :
${subject}

TRADUCTION DU CANDIDAT :
${content}

Critères d'évaluation pour la version (sur 20) :
- Langue française (8 pts) : orthographe grammaticale, conjugaisons, syntaxe, accords, ponctuation
- Fidélité sémantique (6 pts) : sens préservé, pas de contresens, pas d'omissions
- Qualité stylistique (6 pts) : adaptation des tournures hispanophones en français courant/soutenu, fluidité

Erreurs lourdement sanctionnées : contresens sur le sens espagnol, barbarismes, calques syntaxiques, orthographe grammaticale défaillante (COD/COI, participe passé…).

Donne une évaluation structurée. Pour les erreurs, cite la phrase source espagnole et propose la traduction correcte.`
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = z.object({
    id: z.number().int().positive(),
    content: z.string().min(1),
  }).safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { id, content } = parsed.data

  const session = await getSimulacroById(id)
  if (!session || !session.subject) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // Save response first
  await saveSimulacroResponse(id, content)

  try {
    const { output } = await generateText({
      model: google('gemini-2.5-flash'),
      output: Output.object({ schema: FeedbackSchema }),
      system: EVAL_SYSTEM,
      prompt: getEvalPrompt(session.type, session.subject, content),
    })

    // Serialize feedback as JSON string for storage
    const feedbackJson = JSON.stringify(output)
    await saveSimulacroFeedback(id, feedbackJson, output.score)

    const userId = await getEffectiveUserId()
    await logStudyActivity(userId, 'simulacro', 5)

    return NextResponse.json({ feedback: output, score: output.score })
  } catch (err) {
    console.error('simulacro submit error:', err)
    return NextResponse.json({ error: 'Failed to evaluate submission' }, { status: 500 })
  }
}
