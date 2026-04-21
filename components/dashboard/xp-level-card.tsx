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
      <CardContent className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <Icon className="h-4.5 w-4.5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 leading-none mb-0.5">Progression</p>
              <p className="text-sm font-semibold text-slate-900">{getLevelTitle(level_xp)}</p>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-violet-600 text-white shrink-0">
            Niv.&nbsp;{level_xp}
          </span>
        </div>

        {xpLost > 0 && <XpDecayBanner xpLost={xpLost} />}

        {/* XP bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-800">
              {xp.toLocaleString('fr-FR')} XP
            </span>
            <span className="text-xs text-slate-400">
              +{(nextThreshold - xp).toLocaleString('fr-FR')} pour niveau {level_xp + 1}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5 text-right">{pct}% complété</p>
        </div>
      </CardContent>
    </Card>
  )
}
