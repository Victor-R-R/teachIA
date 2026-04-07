import Link from 'next/link'
import { getExercises } from '@/lib/db'
import { GenerateExerciseButton } from '@/components/exercises/generate-exercise-button'
import { DOMAINS, LEVELS } from '@/lib/constants'
import type { Domain, Level } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen } from 'lucide-react'

const DOMAIN_LABELS: Record<string, string> = {
  langue: 'Langue',
  civi_espagne: 'Civilisation Espagne',
  civi_latam: 'Amérique latine',
  didactique: 'Didactique',
}

const LEVEL_COLORS: Record<string, string> = {
  A: 'bg-red-500/20 text-red-400 border-red-500/30',
  B: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  C: 'bg-green-500/20 text-green-400 border-green-500/30',
}

const TYPE_LABELS: Record<string, string> = {
  qcm: 'QCM',
  vrai_faux: 'Vrai / Faux',
  lacunaire: 'Texte lacunaire',
  chronologie: 'Chronologie',
  association: 'Association',
}

export default async function ExercicesPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; level?: string }>
}) {
  const params = await searchParams
  const domain = DOMAINS.includes(params.domain as Domain) ? (params.domain as Domain) : undefined
  const level = LEVELS.includes(params.level as Level) ? (params.level as Level) : undefined
  const exercises = await getExercises({ domain, level, limit: 20 })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-100 mb-1">Exercices</h1>
        <p className="text-zinc-400 text-sm">{exercises.length} exercice(s) disponibles</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['langue', 'civi_espagne', 'civi_latam', 'didactique'].map(domain => (
          <Link
            key={domain}
            href={params.domain === domain ? '/exercices' : `/exercices?domain=${domain}`}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              params.domain === domain
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            {DOMAIN_LABELS[domain]}
          </Link>
        ))}
        <span className="border-l border-zinc-700 mx-1" />
        {['A', 'B', 'C'].map(level => (
          <Link
            key={level}
            href={params.level === level ? '/exercices' : `/exercices?level=${level}`}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              params.level === level
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
            }`}
          >
            Niveau {level}
          </Link>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <GenerateExerciseButton />
      </div>

      {/* Exercise cards */}
      <div className="grid gap-3">
        {exercises.map(ex => (
          <Link key={ex.id} href={`/exercices/${ex.id}`}>
            <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-100 text-sm font-medium line-clamp-2 mb-2">
                      {ex.question}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-700">
                        {DOMAIN_LABELS[ex.domain] ?? ex.domain}
                      </Badge>
                      <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-700">
                        {TYPE_LABELS[ex.type] ?? ex.type}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={`text-xs shrink-0 ${LEVEL_COLORS[ex.level]}`}>
                    {ex.level}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {exercises.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <BookOpen className="mx-auto h-8 w-8 mb-3 opacity-50" />
            <p>Aucun exercice trouvé pour ces filtres.</p>
          </div>
        )}
      </div>
    </div>
  )
}
