import Link from 'next/link'
import { getExercises, getAttemptStatsByExercises, getExerciseStatus } from '@/lib/db'
import { EXERCISES } from '@/lib/exercises'
import type { Level as CAPESLevel } from '@/lib/exercises'
import { ExerciseProgressBar } from '@/components/exercises/exercise-progress-bar'
import { GenerateExerciseButton } from '@/components/exercises/generate-exercise-button'
import { LEVELS } from '@/lib/constants'
import type { Level } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { BookOpen, ArrowRight, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const LEVEL_COLORS: Record<string, string> = {
  A: 'bg-red-50 text-red-600 border-red-200',
  B: 'bg-amber-50 text-amber-600 border-amber-200',
  C: 'bg-green-50 text-green-600 border-green-200',
}

const DB_TYPE_LABELS: Record<string, string> = {
  qcm: 'QCM',
  vrai_faux: 'Vrai / Faux',
  lacunaire: 'Texte lacunaire',
  chronologie: 'Chronologie',
  association: 'Association',
}

const DB_DOMAIN_LABELS: Record<string, string> = {
  langue: 'Langue',
  civi_espagne: 'Civilisation Espagne',
  civi_latam: 'Amérique latine',
  didactique: 'Didactique',
}

const CAPES_TYPE_LABELS: Record<string, string> = {
  composition: 'Composition',
  version: 'Version ES→FR',
  theme: 'Thème FR→ES',
  grammaire: 'Grammaire',
  civilisation: 'Civilisation',
  didactique: 'Didactique',
  lecon: 'Leçon audiovisuelle',
  entretien: 'Entretien',
}

export default async function ExercicesPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>
}) {
  const params = await searchParams
  const level = LEVELS.includes(params.level as Level) ? (params.level as Level) : undefined

  const dbExercises = await getExercises({ level, limit: 100 })
  const statsRows = await getAttemptStatsByExercises(dbExercises.map(e => e.id))
  const statsMap = new Map(statsRows.map(s => [s.exercise_id, s]))
  const completedCount = statsRows.filter(s => s.has_correct).length

  const capesExercises = level
    ? EXERCISES.filter(ex => ex.niveau === (level as CAPESLevel))
    : EXERCISES

  const total = dbExercises.length + capesExercises.length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Exercices</h1>
        <p className="text-slate-500 text-sm">
          {total} exercice{total > 1 ? 's' : ''}{' '}
          <span className="text-slate-400">— {dbExercises.length} interactifs · {capesExercises.length} CAPES (Professeur IA)</span>
        </p>
        {completedCount > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-violet-500 rounded-full h-full transition-all"
                style={{ width: `${(completedCount / total) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 shrink-0">{completedCount}/{total} réussis</span>
          </div>
        )}
      </div>

      {/* Level filter + generate button */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {['A', 'B', 'C'].map(lvl => (
          <Link
            key={lvl}
            href={params.level === lvl ? '/exercices' : `/exercices?level=${lvl}`}
            className={`px-3 py-1 rounded-full text-xs border transition-colors cursor-pointer ${
              params.level === lvl
                ? 'bg-violet-600 border-violet-600 text-white'
                : 'border-slate-300 text-slate-500 hover:border-violet-400 hover:text-violet-600'
            }`}
          >
            Niveau {lvl}
          </Link>
        ))}
        <div className="ml-auto">
          <GenerateExerciseButton />
        </div>
      </div>

      {/* DB exercises — interactive */}
      {dbExercises.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" /> Exercices interactifs ({dbExercises.length})
          </h2>
          <div className="grid gap-3">
            {dbExercises.map(ex => (
              <Link key={ex.id} href={`/exercices/${ex.id}`}>
                <Card className="bg-white border-slate-200 hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer">
                  <CardContent className="p-4 pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 text-sm font-medium line-clamp-2 mb-2">
                          {ex.question}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                            {DB_DOMAIN_LABELS[ex.domain] ?? ex.domain}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                            {DB_TYPE_LABELS[ex.type] ?? ex.type}
                          </Badge>
                        </div>
                      </div>
                      <Badge className={`text-xs shrink-0 ${LEVEL_COLORS[ex.level]}`}>
                        {ex.level}
                      </Badge>
                    </div>
                    {(() => {
                      const status = getExerciseStatus(statsMap.get(ex.id))
                      return status !== 'not_started' ? (
                        <div className="mt-3">
                          <ExerciseProgressBar status={status} height={3} />
                        </div>
                      ) : null
                    })()}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CAPES exercises — IA-conducted */}
      {capesExercises.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MessageCircle className="h-3.5 w-3.5" /> Exercices CAPES — Professeur IA ({capesExercises.length})
          </h2>
          <div className="grid gap-3">
            {capesExercises.map(ex => (
              <Card key={ex.id} className="bg-white border-slate-200 hover:border-violet-300 hover:shadow-sm transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 text-sm font-medium mb-2">{ex.titre}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                          {CAPES_TYPE_LABELS[ex.type] ?? ex.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`text-xs ${LEVEL_COLORS[ex.niveau]}`}>
                        {ex.niveau}
                      </Badge>
                      <Link
                        href={`/chat?exercise=${ex.id}`}
                        className={cn(
                          buttonVariants({ size: 'sm' }),
                          'bg-violet-600 hover:bg-violet-700 text-white gap-1'
                        )}
                      >
                        Démarrer <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="text-center py-12 text-slate-400">
          <BookOpen className="mx-auto h-8 w-8 mb-3 opacity-50" />
          <p>Aucun exercice pour ce niveau.</p>
        </div>
      )}
    </div>
  )
}
