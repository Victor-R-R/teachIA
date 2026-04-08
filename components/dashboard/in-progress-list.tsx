import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, BookOpen, FileText } from 'lucide-react'
import type { InProgressExercise, ExamSession } from '@/lib/db'
import { DOMAIN_LABELS, LEVEL_COLORS } from '@/lib/constants'

const TYPE_LABELS: Record<string, string> = {
  composition: 'Composition',
  traduction: 'Traduction',
  explication: 'Explication de texte',
}

interface InProgressListProps {
  exercises: InProgressExercise[]
  simulations: ExamSession[]
}

export function InProgressList({ exercises, simulations }: InProgressListProps) {
  if (exercises.length === 0 && simulations.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-violet-500" />
        À reprendre
      </h2>
      <div className="grid gap-2">
        {exercises.map(ex => (
          <Link key={ex.id} href={`/exercices/${ex.id}`}>
            <Card className="bg-white border-slate-200 hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer">
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 line-clamp-1 mb-1">{ex.question}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {DOMAIN_LABELS[ex.domain] ?? ex.domain}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-amber-600">
                      {ex.attempt_count} tentative{ex.attempt_count > 1 ? 's' : ''} sans succès
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={`text-xs ${LEVEL_COLORS[ex.level]}`}>{ex.level}</Badge>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {simulations.map(sim => (
          <Link key={sim.id} href={`/simulacros/${sim.id}`}>
            <Card className="bg-white border-slate-200 hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer">
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <p className="text-sm text-slate-900">
                      Simulation — {TYPE_LABELS[sim.type] ?? sim.type}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    Commencée le{' '}
                    {new Date(sim.timestamp).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
