import { generateText, Output } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { createSimulacro } from '@/lib/db'
import { getEffectiveUserId } from '@/lib/session'
import { z } from 'zod'

const SIMULACRO_TYPES = ['composition', 'theme', 'version'] as const
type SimulacroType = typeof SIMULACRO_TYPES[number]

const SubjectSchema = z.object({
  title: z.string(),
  subject: z.string(),
})

const SYSTEM_PROMPT = `Tu es un expert du CAPES d'espagnol qui crée des sujets d'entraînement réalistes et rigoureux, conformes aux exigences du jury officiel (rapport Christine Lavail 2025).

Pour le champ "subject", utilise du markdown riche :
- **Titre en gras** pour chaque document (ex: **Document 1 — Extrait littéraire**)
- *Italique* pour les titres d'œuvres et les termes en espagnol
- Numérotation claire des lignes pour les textes de traduction (1., 2., 3., ...)
- Séparation visuelle (---) entre la consigne, chaque document, et la question de traduction`

function getPrompt(type: SimulacroType): string {
  if (type === 'composition') {
    return `Génère un sujet de composition CAPES d'espagnol complet et réaliste.

La composition est la principale épreuve écrite (durée ~4h dans une épreuve totale de 6h).

Structure OBLIGATOIRE du sujet :
1. Une consigne officielle en espagnol du type : "En español, destaque una problemática que le permita organizar una reflexión a partir de estos tres documentos en relación con la temática '[thème]'"
2. Un thème ou axe d'étude tiré des programmes lycée/collège (exemples : "Discours et luttes politiques", "Lieux et formes du pouvoir", "Voyages et exils", "Représentations culturelles", "Altérité et convivencia", "Fictions et réalités")
3. Trois documents fictifs mais réalistes :
   - Document 1 : toujours un extrait d'œuvre littéraire ou essai (avec auteur, titre en italique, date, éditeur fictif réaliste) — 8-12 lignes de texte authentique en espagnol
   - Document 2 : article de presse, discours ou texte civilisationnel (avec source, date) — 6-10 lignes
   - Document 3 : autre document complémentaire (différent genre/époque) — 6-10 lignes

Le titre doit être court : "Composition — [thème]"
Le champ "subject" doit contenir le sujet complet mis en forme avec les 3 documents.`
  }

  if (type === 'theme') {
    return `Génère un sujet de thème (traduction FR→ES) pour le CAPES d'espagnol.

Le thème est réalisé en ~45 minutes dans l'épreuve de traduction.

Structure du sujet :
- Un extrait littéraire en français de 25-35 lignes numérotées (style romanesque, registre soutenu)
- Source : auteur français connu (Modiano, Duras, Perec, Yourcenar, Le Clézio, Gracq, Proust, Camus, Sartre, Flaubert, Stendhal, Balzac…), titre d'œuvre, date
- Une "question de choix de traduction" : pointer une construction grammaticale spécifique (ex: emploi du subjonctif, traduction de "on", concordance des temps, relatif "dont", proposition hypothétique, voix passive, gérondif…) et demander de justifier le choix de traduction en s'appuyant sur la grammaire comparée

Critères de qualité :
- Texte riche en difficultés grammaticales typiques (accords, ser/estar, temps verbaux, pronoms)
- Registre littéraire authentique, pas trop moderne
- Longueur réaliste (≈ 250-350 mots)

Le titre : "Thème — [auteur, titre]"
Le "subject" : consigne + texte français numéroté + question de choix de traduction`
  }

  // version
  return `Génère un sujet de version (traduction ES→FR) pour le CAPES d'espagnol.

La version est réalisée en ~45 minutes dans l'épreuve de traduction.

Structure du sujet :
- Un extrait littéraire en espagnol de 25-35 lignes numérotées (style romanesque ou essayistique, registre soutenu)
- Source : auteur hispanophone reconnu (Borges, García Márquez, Vargas Llosa, Cervantes, Quevedo, Lorca, Machado, Neruda, Fuentes, Padura, Grandes, Marías, Cercas, Mendoza…), titre d'œuvre, date
- Une "question de choix de traduction" : pointer une construction grammaticale spécifique de l'espagnol (ex: emploi de "cuyo", ser/estar, subjonctif imparfait, usage de "se", concordance des temps, impersonnel, gérondif espagnol…) et demander de justifier le choix de traduction

Critères de qualité :
- Texte riche en difficultés typiques (accentuation, modes verbaux, syntaxe)
- Registre littéraire authentique
- Longueur réaliste (≈ 250-350 mots)

Le titre : "Version — [auteur, titre]"
Le "subject" : consigne + texte espagnol numéroté + question de choix de traduction`
}

export async function POST(req: NextRequest) {
  const userId = await getEffectiveUserId()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = z.object({
    type: z.enum(SIMULACRO_TYPES),
  }).safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  const { type } = parsed.data

  try {
    const { output } = await generateText({
      model: 'anthropic/claude-sonnet-4.6',
      output: Output.object({ schema: SubjectSchema }),
      system: SYSTEM_PROMPT,
      prompt: getPrompt(type),
    })

    const session = await createSimulacro(userId, type, output.title, output.subject)
    return NextResponse.json({ id: session.id, title: output.title, subject: output.subject })
  } catch (err) {
    console.error('simulacro generate error:', err)
    return NextResponse.json({ error: 'Failed to generate subject' }, { status: 500 })
  }
}
