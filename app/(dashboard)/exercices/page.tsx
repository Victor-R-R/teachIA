export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getExercises, getAttemptStatsByExercises, getExerciseStatus, getCAPESConversationMap } from '@/lib/db'
import { getEffectiveUserId } from '@/lib/session'
import { EXERCISES } from '@/lib/exercises'
import type { Level as CAPESLevel } from '@/lib/exercises'
import { ExerciseProgressBar } from '@/components/exercises/exercise-progress-bar'
import { GenerateExerciseButton } from '@/components/exercises/generate-exercise-button'
import { LEVELS, LEVEL_COLORS, DOMAIN_LABELS } from '@/lib/constants'
import type { Level } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { BookOpen, ArrowRight, MessageCircle, PenLine, Languages, BookA, Landmark, GraduationCap, Video, Users, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const DB_TYPE_LABELS: Record<string, string> = {
  qcm: 'QCM',
  vrai_faux: 'Vrai / Faux',
  lacunaire: 'Texte lacunaire',
  chronologie: 'Chronologie',
  association: 'Association',
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

const CAPES_TYPE_ICONS: Record<string, React.ElementType> = {
  composition: PenLine,
  version: Languages,
  theme: Globe,
  grammaire: BookA,
  civilisation: Landmark,
  didactique: GraduationCap,
  lecon: Video,
  entretien: Users,
}

const CAPES_TYPE_COLORS: Record<string, { bg: string; icon: string; border: string }> = {
  composition: { bg: 'bg-violet-50', icon: 'text-violet-600', border: 'border-violet-100' },
  version:     { bg: 'bg-blue-50',   icon: 'text-blue-600',   border: 'border-blue-100' },
  theme:       { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-100' },
  grammaire:   { bg: 'bg-amber-50',  icon: 'text-amber-600',  border: 'border-amber-100' },
  civilisation:{ bg: 'bg-emerald-50',icon: 'text-emerald-600',border: 'border-emerald-100' },
  didactique:  { bg: 'bg-rose-50',   icon: 'text-rose-600',   border: 'border-rose-100' },
  lecon:       { bg: 'bg-sky-50',    icon: 'text-sky-600',    border: 'border-sky-100' },
  entretien:   { bg: 'bg-slate-50',  icon: 'text-slate-600',  border: 'border-slate-200' },
}

export default async function ExercicesPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>
}) {
  const params = await searchParams
  const level = LEVELS.includes(params.level as Level) ? (params.level as Level) : undefined
  const userId = await getEffectiveUserId()

  const [dbExercises, capesConvMap] = await Promise.all([
    getExercises(userId, { level, limit: 100 }),
    getCAPESConversationMap(userId),
  ])
  const statsRows = await getAttemptStatsByExercises(userId, dbExercises.map(e => e.id))
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

      {/* Level legend */}
      <div className="flex items-center gap-3 mb-6 text-xs text-slate-400">
        <span className="shrink-0">Niveaux :</span>
        {(['A', 'B', 'C'] as const).map((lvl) => (
          <span key={lvl} className={`px-1.5 py-0.5 rounded border font-medium ${LEVEL_COLORS[lvl]}`}>
            {lvl}
          </span>
        ))}
        <span>→ débutant · intermédiaire · avancé</span>
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
                          {ex.title ?? ex.question}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                            {DOMAIN_LABELS[ex.domain] ?? ex.domain}
                          </Badge>
                          {ex.questions && ex.questions.length > 0 ? (
                            <Badge variant="outline" className="text-xs text-slate-400 border-slate-200">
                              {ex.questions.length} questions
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-slate-500 border-slate-200">
                              {DB_TYPE_LABELS[ex.type] ?? ex.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge className={`text-xs shrink-0 ${LEVEL_COLORS[ex.level]}`}>
                        {ex.level}
                      </Badge>
                    </div>
                    {(() => {
                      const stats = statsMap.get(ex.id)
                      const status = getExerciseStatus(stats)
                      return status !== 'not_started' ? (
                        <div className="mt-3 flex items-center gap-2">
                          <ExerciseProgressBar status={status} height={3} />
                          {stats?.best_score_correct != null && stats?.best_score_total != null && (
                            <span className="text-xs text-slate-400 shrink-0">
                              {stats.best_score_correct}/{stats.best_score_total}
                            </span>
                          )}
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
            {capesExercises.map(ex => {
              const colors = CAPES_TYPE_COLORS[ex.type] ?? CAPES_TYPE_COLORS.entretien
              const Icon = CAPES_TYPE_ICONS[ex.type] ?? BookOpen
              const existingConvId = capesConvMap.get(ex.id)
              const started = !!existingConvId
              const href = started
                ? `/exercices/capes/${ex.id}?id=${existingConvId}`
                : `/exercices/capes/${ex.id}`
              return (
                <Card key={ex.id} className="bg-white border-slate-200 hover:border-violet-300 hover:shadow-sm transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('flex items-center justify-center h-9 w-9 rounded-lg shrink-0', colors.bg, colors.border, 'border')}>
                        <Icon className={cn('h-4 w-4', colors.icon)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 text-sm font-medium leading-snug">{ex.titre}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', colors.bg, colors.icon)}>
                            {CAPES_TYPE_LABELS[ex.type] ?? ex.type}
                          </span>
                          <Badge className={cn('text-xs', LEVEL_COLORS[ex.niveau])}>
                            {ex.niveau}
                          </Badge>
                        </div>
                      </div>
                      <Link
                        href={href}
                        className={cn(
                          buttonVariants({ size: 'sm' }),
                          started
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shrink-0'
                            : 'bg-violet-600 hover:bg-violet-700 text-white gap-1 shrink-0'
                        )}
                      >
                        {started ? 'Reprendre' : 'Démarrer'} <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
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
