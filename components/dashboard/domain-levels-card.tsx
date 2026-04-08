import { Card, CardContent } from '@/components/ui/card'
import type { UserProfile } from '@/lib/db'
import { LEVEL_COLORS } from '@/lib/constants'

const DOMAIN_ROWS = [
  { label: 'Langue', key: 'level_langue' },
  { label: 'Civilisation', key: 'level_civi' },
  { label: 'Didactique', key: 'level_didactique' },
] as const

const LEVEL_DOTS: Record<'A' | 'B' | 'C', number> = { A: 1, B: 2, C: 3 }

export function DomainLevelsCard({ profile }: { profile: UserProfile }) {
  return (
    <Card className="bg-white border-slate-200">
      <CardContent className="p-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
          Niveaux par domaine
        </p>
        <div className="space-y-2.5">
          {DOMAIN_ROWS.map(({ label, key }) => {
            const level = profile[key] as 'A' | 'B' | 'C' | null
            return (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="flex gap-0.5">
                    {[1, 2, 3].map(i => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          level && i <= LEVEL_DOTS[level]
                            ? 'bg-violet-400'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </span>
                  {level ? (
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${LEVEL_COLORS[level]}`}>
                      {level}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
