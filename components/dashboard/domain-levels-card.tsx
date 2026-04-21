import { Card, CardContent } from '@/components/ui/card'
import type { UserProfile } from '@/lib/db'
import { LEVEL_COLORS } from '@/lib/constants'

const DOMAIN_ROWS = [
  { label: 'Langue', key: 'level_langue', bar: 'bg-violet-500', dot: 'bg-violet-400' },
  { label: 'Civilisation', key: 'level_civi', bar: 'bg-blue-500', dot: 'bg-blue-400' },
  { label: 'Didactique', key: 'level_didactique', bar: 'bg-amber-500', dot: 'bg-amber-400' },
] as const

const LEVEL_PCT: Record<'A' | 'B' | 'C', number> = { A: 96, B: 62, C: 28 }

export function DomainLevelsCard({ profile }: { profile: UserProfile }) {
  return (
    <Card className="bg-white border-slate-200">
      <CardContent className="p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Niveaux par domaine
        </p>
        <div className="space-y-4">
          {DOMAIN_ROWS.map(({ label, key, bar, dot }) => {
            const level = profile[key] as 'A' | 'B' | 'C' | null
            const pct = level ? LEVEL_PCT[level] : 0
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                    <span className="text-sm text-slate-700">{label}</span>
                  </div>
                  {level ? (
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${LEVEL_COLORS[level]}`}>
                      {level}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Non évalué</span>
                  )}
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${bar} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
