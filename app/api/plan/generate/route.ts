import { generateText, Output } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createUserProfile, saveStudyPlan } from '@/lib/db'

const PlanWeekSchema = z.object({
  week_number: z.number().int().positive(),
  domain: z.enum(['langue', 'civi_espagne', 'civi_latam', 'didactique']),
  objective: z.string().min(1),
})

const PlanSchema = z.array(PlanWeekSchema)

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const RequestSchema = z.object({
    exam_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    level_langue: z.enum(['A', 'B', 'C']),
    level_civi: z.enum(['A', 'B', 'C']),
    level_didactique: z.enum(['A', 'B', 'C']),
    weeks_remaining: z.number().int().positive(),
  })

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { exam_date, level_langue, level_civi, level_didactique, weeks_remaining } = parsed.data

  const intensity = weeks_remaining < 8 ? 'intensif' : weeks_remaining < 16 ? 'modéré' : 'progressif'

  // Priorité aux domaines faibles (niveau A en premier)
  const domainPriority = [
    { domain: 'langue', level: level_langue },
    { domain: 'civi_espagne', level: level_civi },
    { domain: 'civi_latam', level: level_civi },
    { domain: 'didactique', level: level_didactique },
  ].sort((a, b) => {
    const order = { A: 0, B: 1, C: 2 }
    return order[a.level] - order[b.level]
  })

  try {
    const { output } = await generateText({
      model: 'anthropic/claude-sonnet-4.6',
      output: Output.object({ schema: PlanSchema }),
      system: `Tu es un expert en préparation du CAPES d'espagnol. Tu génères des plans de révision personnalisés, réalistes et progressifs.`,
      prompt: `Génère un plan de révision pour le CAPES d'espagnol avec les paramètres suivants :
- Semaines restantes avant le concours : ${weeks_remaining}
- Rythme : ${intensity}
- Niveaux actuels :
  - Langue : ${level_langue} (A=faible, B=moyen, C=bon)
  - Civilisation Espagne : ${level_civi}
  - Civilisation Amérique latine : ${level_civi}
  - Didactique : ${level_didactique}
- Priorité par domaine (du plus faible au plus fort) : ${domainPriority.map(d => d.domain).join(' > ')}

Génère exactement ${Math.min(weeks_remaining, 12)} entrées de plan.
Chaque entrée doit avoir :
- week_number : numéro de semaine (1 à ${Math.min(weeks_remaining, 12)})
- domain : l'un des 4 domaines
- objective : objectif précis et actionnable pour la semaine (ex: "Maîtriser le subjonctif imparfait et les périphrases verbales", "Réviser la Guerre Civile espagnole : causes, acteurs, conséquences")

Répartis les domaines de façon équilibrée mais en accordant plus de semaines aux domaines de niveau A. Adapte le rythme au mode ${intensity}.`,
    })

    // Sauvegarder le profil utilisateur
    await createUserProfile({ level_langue, level_civi, level_didactique })

    // Calculer les dates cibles et sauvegarder le plan
    const startDate = new Date()
    const planItems = output.map(item => {
      const targetDate = new Date(startDate)
      targetDate.setDate(startDate.getDate() + (item.week_number - 1) * 7)
      return {
        week_number: item.week_number,
        domain: item.domain,
        objective: item.objective,
        target_date: targetDate.toISOString().split('T')[0],
      }
    })

    await saveStudyPlan(planItems)

    return NextResponse.json({ success: true, weeks: planItems.length })
  } catch (err) {
    console.error('plan/generate error:', err)
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 })
  }
}
