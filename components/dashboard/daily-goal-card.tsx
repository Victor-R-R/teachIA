import { Timer } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getDailyMessage } from '@/lib/levels'
import { DailyGoalEditor } from './daily-goal-editor'

interface DailyGoalCardProps {
  todayMinutes: number
  goalMinutes: number
}

export function DailyGoalCard({ todayMinutes, goalMinutes }: DailyGoalCardProps) {
  const pct = goalMinutes > 0 ? Math.min(100, Math.round((todayMinutes / goalMinutes) * 100)) : 0

  return (
    <Card className="bg-white border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-violet-500 shrink-0" />
            <span className="text-sm font-medium text-slate-900">Objectif du jour</span>
          </div>
          <DailyGoalEditor currentGoal={goalMinutes} />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span>{todayMinutes} / {goalMinutes} min</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : 'bg-violet-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-slate-500">{getDailyMessage(pct)}</p>
      </CardContent>
    </Card>
  )
}
