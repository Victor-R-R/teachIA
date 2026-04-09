export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Target, FileText, Languages, BookOpen, CheckCircle2, Clock } from 'lucide-react'
import { getSimulacros } from '@/lib/db'
import { StartSimulacroButton } from '@/components/simulacros/start-simulacro-button'

const TYPE_META = {
  composition: {
    icon: FileText,
    label: 'Composition',
    desc: 'Dossier de 3 documents · Problématique + plan + développement rédigé en espagnol',
    duration: '~4h',
    coeff: 'Coeff. 2 — Admissibilité',
    color: 'violet',
  },
  theme: {
    icon: Languages,
    label: 'Thème',
    desc: 'Traduction FR → ES · Texte littéraire + question de choix de traduction',
    duration: '~45 min',
    coeff: 'Admissibilité',
    color: 'blue',
  },
  version: {
    icon: BookOpen,
    label: 'Version',
    desc: 'Traduction ES → FR · Texte littéraire + question de choix de traduction',
    duration: '~45 min',
    coeff: 'Admissibilité',
    color: 'teal',
  },
} as const

type SimulacroType = keyof typeof TYPE_META

const APPRECIATION_LABELS: Record<string, string> = {
  insuffisant: 'Insuffisant',
  passable: 'Passable',
  assez_bien: 'Assez bien',
  bien: 'Bien',
  tres_bien: 'Très bien',
}

const TYPE_LABELS: Record<string, string> = {
  composition: 'Composition',
  theme: 'Thème',
  version: 'Version',
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null
  const s = Number(score)
  const color =
    s >= 14 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : s >= 10 ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-red-50 text-red-700 border-red-200'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${color}`}>
      {s}/20
    </span>
  )
}

import { getEffectiveUserId } from '@/lib/session'

export default async function SimulacrosPage() {
  const userId = await getEffectiveUserId()
  const sessions = await getSimulacros(userId)

  const stats = {
    total: sessions.length,
    done: sessions.filter(s => s.ai_feedback !== null).length,
    avgScore: (() => {
      const scored = sessions.filter(s => s.score !== null)
      if (scored.length === 0) return null
      return (scored.reduce((acc, s) => acc + Number(s.score), 0) / scored.length).toFixed(1)
    })(),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Simulacros</h1>
        <p className="text-slate-500 text-sm">
          Entraîne-toi dans les conditions réelles du CAPES — sujets générés par IA, correction détaillée.
        </p>
      </div>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="flex gap-4 flex-wrap">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-center min-w-[100px]">
            <div className="text-2xl font-semibold text-slate-900">{stats.total}</div>
            <div className="text-xs text-slate-500 mt-0.5">sessions</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-center min-w-[100px]">
            <div className="text-2xl font-semibold text-emerald-600">{stats.done}</div>
            <div className="text-xs text-slate-500 mt-0.5">corrigées</div>
          </div>
          {stats.avgScore && (
            <div className="bg-violet-50 border border-violet-200 rounded-lg px-4 py-3 text-center min-w-[100px]">
              <div className="text-2xl font-semibold text-violet-700">{stats.avgScore}</div>
              <div className="text-xs text-slate-500 mt-0.5">moy. /20</div>
            </div>
          )}
        </div>
      )}

      {/* Type cards */}
      <div>
        <h2 className="text-sm font-medium text-slate-700 mb-3">Démarrer un simulacro</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.entries(TYPE_META) as [SimulacroType, typeof TYPE_META[SimulacroType]][]).map(([type, meta]) => {
            const Icon = meta.icon
            return (
              <div
                key={type}
                className="border border-slate-200 rounded-xl p-5 bg-white flex flex-col gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-sm">{meta.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{meta.coeff}</div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{meta.desc}</p>
                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {meta.duration}
                  </span>
                </div>
                <StartSimulacroButton type={type} label={`Générer un sujet`} />
              </div>
            )
          })}
        </div>
      </div>

      {/* History */}
      {sessions.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-slate-700 mb-3">Historique</h2>
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            {sessions.map((session, i) => (
              <Link
                key={session.id}
                href={`/simulacros/${session.id}`}
                className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors ${
                  i > 0 ? 'border-t border-slate-100' : ''
                }`}
              >
                {/* Status icon */}
                <div className="shrink-0">
                  {session.ai_feedback ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Target className="h-4 w-4 text-amber-400" />
                  )}
                </div>

                {/* Title + type */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {session.title ?? `${TYPE_LABELS[session.type] ?? session.type} #${session.id}`}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {session.ai_feedback ? 'Corrigé' : 'En cours'}
                    {' · '}
                    {new Date(session.timestamp).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                </div>

                {/* Score */}
                <div className="shrink-0">
                  {session.ai_feedback
                    ? <ScoreBadge score={session.score} />
                    : <span className="text-xs text-amber-600 font-medium">À rendre</span>
                  }
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {sessions.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Target className="mx-auto h-8 w-8 mb-3 opacity-40" />
          <p className="text-sm font-medium text-slate-500">Aucun simulacro pour l&apos;instant</p>
          <p className="text-xs mt-1">Génère ton premier sujet avec les cartes ci-dessus.</p>
        </div>
      )}
    </div>
  )
}
