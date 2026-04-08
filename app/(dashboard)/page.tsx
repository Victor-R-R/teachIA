import Link from 'next/link'
import { Target } from 'lucide-react'
import { getUserProfile, getTodayMinutes, getInProgressExercises, getInProgressSimulations } from '@/lib/db'
import { XPLevelCard } from '@/components/dashboard/xp-level-card'
import { DomainLevelsCard } from '@/components/dashboard/domain-levels-card'
import { DailyGoalCard } from '@/components/dashboard/daily-goal-card'
import { InProgressList } from '@/components/dashboard/in-progress-list'

export default async function DashboardPage() {
  const [profile, todayMin, inProgressExercises, inProgressSims] = await Promise.all([
    getUserProfile(),
    getTodayMinutes(),
    getInProgressExercises(),
    getInProgressSimulations(),
  ])

  // Onboarding CTA
  if (!profile) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Tableau de bord</h1>
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-6 flex flex-col items-center text-center gap-4 max-w-md mx-auto">
          <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
            <Target className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 mb-1">Commence par évaluer ton niveau</p>
            <p className="text-sm text-slate-500">
              Fais le test de niveau pour personnaliser ton parcours de révision.
            </p>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Passer le test →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Tableau de bord</h1>

      {/* Zone 2 — Progression */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <XPLevelCard profile={profile} />
        <DomainLevelsCard profile={profile} />
      </div>

      {/* Zone 3 — Objectif du jour */}
      <DailyGoalCard
        todayMinutes={todayMin}
        goalMinutes={profile.daily_goal_min}
      />

      {/* Zone 4 — En cours */}
      <InProgressList
        exercises={inProgressExercises}
        simulations={inProgressSims}
      />
    </div>
  )
}
