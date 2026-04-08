import { Zap, Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getLevelTitle, getXpThreshold } from '@/lib/levels'
import type { UserProfile } from '@/lib/db'
import { XpDecayBanner } from './xp-decay-banner'

export function XPLevelCard({ profile, xpLost = 0 }: { profile: UserProfile; xpLost?: number }) {
  const { xp, level_xp } = profile
  const currentThreshold = getXpThreshold(level_xp - 1)
  const nextThreshold = getXpThreshold(level_xp + 1)
  const xpInLevel = xp - currentThreshold
  const xpNeeded = nextThreshold - currentThreshold
  const pct = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))

  const Icon = level_xp >= 6 ? Trophy : Zap

  return (
    <Card className="bg-white border-slate-200">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-violet-500 shrink-0" />
          <span className="text-sm font-medium text-slate-900">
            Niveau {level_xp} — {getLevelTitle(level_xp)}
          </span>
        </div>
        {xpLost > 0 && <XpDecayBanner xpLost={xpLost} />}
        <div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full bg-violet-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 text-right">
            {xp} / {nextThreshold} XP · +{nextThreshold - xp} pour le niveau {level_xp + 1}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
