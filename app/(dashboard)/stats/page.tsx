export const dynamic = 'force-dynamic'

import {
  getGlobalStats,
  getDomainStats,
  getDailyActivity,
  getSimulacroGlobalStats,
  getFlashcardGlobalStats,
} from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart2, CheckCircle2, Clock, BookOpen, CreditCard, Target } from 'lucide-react'

const DOMAIN_LABELS: Record<string, string> = {
  langue: 'Langue',
  civi_espagne: 'Civi. Espagne',
  civi_latam: 'Civi. Latam',
  didactique: 'Didactique',
}

const DOMAIN_COLORS: Record<string, string> = {
  langue: 'bg-violet-500',
  civi_espagne: 'bg-blue-500',
  civi_latam: 'bg-emerald-500',
  didactique: 'bg-amber-500',
}

function pct(a: number, b: number) {
  if (b === 0) return 0
  return Math.round((a / b) * 100)
}

function formatMinutes(min: number) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h${m}` : `${h}h`
}

// Generate last 7 days labels including days with no activity
function buildWeekData(activity: { date: string; duration_min: number; exercises_done: number }[]) {
  const map = new Map(activity.map(a => [a.date, a]))
  const days: { label: string; date: string; exercises_done: number; duration_min: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    const entry = map.get(iso)
    days.push({
      label: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
      date: iso,
      exercises_done: entry?.exercises_done ?? 0,
      duration_min: entry?.duration_min ?? 0,
    })
  }
  return days
}

export default async function StatsPage() {
  const [global, domains, activity, simulacros, flashcards] = await Promise.all([
    getGlobalStats(),
    getDomainStats(),
    getDailyActivity(7),
    getSimulacroGlobalStats(),
    getFlashcardGlobalStats(),
  ])

  const successRate = pct(global.correct_count, global.total_attempts)
  const weekData = buildWeekData(activity)
  const maxExercises = Math.max(...weekData.map(d => d.exercises_done), 1)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Statistiques</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-violet-500" />
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Exercices</span>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{global.total_attempts}</p>
            <p className="text-xs text-slate-400 mt-0.5">{global.unique_exercises} uniques</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Réussite</span>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{successRate}%</p>
            <p className="text-xs text-slate-400 mt-0.5">{global.correct_count} / {global.total_attempts}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Temps</span>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{formatMinutes(global.total_study_min)}</p>
            <p className="text-xs text-slate-400 mt-0.5">temps total étudié</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Simulacros</span>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{simulacros.total}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {simulacros.avg_score !== null ? `moy. ${simulacros.avg_score}/20` : 'aucune correction'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 7-day activity */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-4 w-4 text-violet-500" />
            <p className="text-sm font-medium text-slate-900">Activité — 7 derniers jours</p>
          </div>
          <div className="flex items-end gap-2 h-24">
            {weekData.map(day => {
              const barPct = pct(day.exercises_done, maxExercises)
              const isToday = day.date === new Date().toISOString().slice(0, 10)
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center" style={{ height: '72px' }}>
                    <div
                      className={`w-full rounded-t transition-all ${isToday ? 'bg-violet-500' : 'bg-violet-200'}`}
                      style={{ height: `${Math.max(barPct, day.exercises_done > 0 ? 8 : 0)}%` }}
                      title={`${day.exercises_done} exercices · ${day.duration_min} min`}
                    />
                  </div>
                  <span className={`text-xs capitalize ${isToday ? 'text-violet-600 font-medium' : 'text-slate-400'}`}>
                    {day.label}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Domain performance */}
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
              Performance par domaine
            </p>
            {domains.length === 0 ? (
              <p className="text-sm text-slate-400">Aucune tentative encore.</p>
            ) : (
              <div className="space-y-3">
                {domains.map(d => {
                  const rate = pct(d.correct_count, d.attempts)
                  const color = DOMAIN_COLORS[d.domain] ?? 'bg-slate-400'
                  return (
                    <div key={d.domain}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-700">{DOMAIN_LABELS[d.domain] ?? d.domain}</span>
                        <span className="text-xs text-slate-500">{rate}% · {d.attempts} essais</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${color}`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flashcards + Simulacros summary */}
        <div className="space-y-4">
          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-4 w-4 text-violet-500" />
                <p className="text-sm font-medium text-slate-900">Flashcards</p>
              </div>
              {flashcards.total_reviews === 0 ? (
                <p className="text-sm text-slate-400">Aucune révision encore.</p>
              ) : (
                <>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-600">{flashcards.known_count} connues</span>
                    <span className="text-slate-400">{flashcards.total_reviews} révisions</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${pct(flashcards.known_count, flashcards.total_reviews)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 text-right">
                    {pct(flashcards.known_count, flashcards.total_reviews)}% connues
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-medium text-slate-900">Simulacros</p>
              </div>
              {simulacros.total === 0 ? (
                <p className="text-sm text-slate-400">Aucun simulacro encore.</p>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total</span>
                    <span className="font-medium text-slate-900">{simulacros.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Corrigés</span>
                    <span className="font-medium text-slate-900">{simulacros.corrected}</span>
                  </div>
                  {simulacros.avg_score !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Score moyen</span>
                      <span className="font-medium text-slate-900">{simulacros.avg_score}/20</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
