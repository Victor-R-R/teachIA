export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Target, Zap, Trophy, Clock } from 'lucide-react'
import { getUserProfile, getTodayMinutes, getInProgressExercises, getInProgressSimulations, applyXpDecay } from '@/lib/db'
import { getEffectiveUserId } from '@/lib/session'
import { getLevelTitle } from '@/lib/levels'
import { XPLevelCard } from '@/components/dashboard/xp-level-card'
import { DomainLevelsCard } from '@/components/dashboard/domain-levels-card'
import { DailyGoalCard } from '@/components/dashboard/daily-goal-card'
import { InProgressList } from '@/components/dashboard/in-progress-list'

export default async function DashboardPage() {
  const userId = await getEffectiveUserId()
  const xpLost = await applyXpDecay(userId)
  const [profile, todayMin, inProgressExercises, inProgressSims] = await Promise.all([
    getUserProfile(userId),
    getTodayMinutes(userId),
    getInProgressExercises(userId),
    getInProgressSimulations(userId),
  ])

  if (!profile) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Tableau de bord</h1>
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

  const statsItems = [
    {
      icon: Zap,
      label: 'XP total',
      value: profile.xp.toLocaleString('fr-FR'),
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      icon: Trophy,
      label: 'Niveau',
      value: `${profile.level_xp} — ${getLevelTitle(profile.level_xp)}`,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      icon: Clock,
      label: "Aujourd'hui",
      value: `${todayMin} min`,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-sm text-slate-500 mt-0.5">Suivez votre progression CAPES espagnol</p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3">
        {statsItems.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 truncate">{label}</p>
              <p className="text-sm font-semibold text-slate-900 truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progression */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <XPLevelCard profile={profile} xpLost={xpLost} />
        <DomainLevelsCard profile={profile} />
      </div>

      {/* Objectif du jour */}
      <DailyGoalCard
        todayMinutes={todayMin}
        goalMinutes={profile.daily_goal_min}
      />

      {/* En cours */}
      <InProgressList
        exercises={inProgressExercises}
        simulations={inProgressSims}
      />
    </div>
  )
}
