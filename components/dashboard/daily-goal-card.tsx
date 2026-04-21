import { Timer, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getDailyMessage } from '@/lib/levels'
import { DailyGoalEditor } from './daily-goal-editor'

interface DailyGoalCardProps {
  todayMinutes: number
  goalMinutes: number
}

export function DailyGoalCard({ todayMinutes, goalMinutes }: DailyGoalCardProps) {
  const pct = goalMinutes > 0 ? Math.min(100, Math.round((todayMinutes / goalMinutes) * 100)) : 0
  const isComplete = pct >= 100

  return (
    <Card className={`border-slate-200 transition-colors ${isComplete ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isComplete ? 'bg-green-100' : 'bg-violet-100'}`}>
              {isComplete
                ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                : <Timer className="h-5 w-5 text-violet-600" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Objectif du jour</p>
              <p className={`text-xs mt-0.5 ${isComplete ? 'text-green-600 font-medium' : 'text-slate-500'}`}>
                {getDailyMessage(pct)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="text-right">
              <span className={`text-2xl font-bold tabular-nums ${isComplete ? 'text-green-600' : 'text-violet-600'}`}>
                {todayMinutes}
              </span>
              <span className="text-sm text-slate-400 ml-1">/ {goalMinutes} min</span>
            </div>
            <DailyGoalEditor currentGoal={goalMinutes} />
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${isComplete ? 'bg-green-500' : 'bg-violet-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-xs text-slate-400">{pct}% de l'objectif</span>
            {!isComplete && goalMinutes > todayMinutes && (
              <span className="text-xs text-slate-400">{goalMinutes - todayMinutes} min restantes</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
