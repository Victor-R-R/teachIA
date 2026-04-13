export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getExerciseById } from '@/lib/exercises'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const TYPE_CONFIG: Record<string, { icon: string; label: string; bg: string; border: string; text: string; accent: string }> = {
  composition: { icon: '✍️', label: 'Composition',         bg: 'bg-violet-50',  border: 'border-violet-200', text: 'text-violet-900', accent: 'bg-violet-600' },
  version:     { icon: '🔄', label: 'Version (ES→FR)',      bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-900',   accent: 'bg-blue-600'   },
  theme:       { icon: '🌐', label: 'Thème (FR→ES)',        bg: 'bg-indigo-50',  border: 'border-indigo-200', text: 'text-indigo-900', accent: 'bg-indigo-600' },
  grammaire:   { icon: '📝', label: 'Grammaire',            bg: 'bg-slate-50',   border: 'border-slate-200',  text: 'text-slate-900',  accent: 'bg-slate-600'  },
  civilisation:{ icon: '🏛️', label: 'Civilisation',        bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-900',  accent: 'bg-amber-600'  },
  didactique:  { icon: '🎓', label: 'Didactique',           bg: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-900',accent: 'bg-emerald-600'},
  lecon:       { icon: '🎥', label: 'Leçon audiovisuelle',  bg: 'bg-rose-50',    border: 'border-rose-200',   text: 'text-rose-900',   accent: 'bg-rose-600'   },
  entretien:   { icon: '💬', label: 'Entretien',            bg: 'bg-cyan-50',    border: 'border-cyan-200',   text: 'text-cyan-900',   accent: 'bg-cyan-600'   },
}

const LEVEL_CONFIG: Record<string, { emoji: string; label: string; badge: string }> = {
  A: { emoji: '🟢', label: 'Consolidation',   badge: 'bg-green-100 text-green-700 border border-green-200' },
  B: { emoji: '🟡', label: 'Intermédiaire',   badge: 'bg-amber-100 text-amber-700 border border-amber-200' },
  C: { emoji: '🔴', label: 'Niveau concours', badge: 'bg-red-100   text-red-700   border border-red-200'   },
}

export default async function CapesExercisePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const exercise = getExerciseById(id)

  if (!exercise) notFound()

  const typeConf  = TYPE_CONFIG[exercise.type]  ?? TYPE_CONFIG.composition
  const levelConf = LEVEL_CONFIG[exercise.niveau] ?? LEVEL_CONFIG.A

  const exerciseContext = `Exercice en cours : "${exercise.titre}" (${exercise.id}, niveau ${exercise.niveau}).
Énoncé : ${exercise.enonce}${exercise.indications ? `\nIndications : ${exercise.indications}` : ''}

L'élève va envoyer sa réponse. Corrige-la avec ✅/❌/💡 et guide-le étape par étape.`

  const initialPrompt = exerciseContext

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="mb-3 shrink-0 space-y-2.5">

        {/* Breadcrumb */}
        <Link
          href="/exercices"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour aux exercices
        </Link>

        {/* Header card */}
        <div className={`rounded-xl border p-3.5 ${typeConf.bg} ${typeConf.border}`}>
          <div className="flex items-start gap-3">
            <div className={`flex items-center justify-center h-10 w-10 rounded-xl text-white text-lg shrink-0 ${typeConf.accent}`}>
              {typeConf.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${levelConf.badge}`}>
                  {levelConf.emoji} {levelConf.label}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/70 border ${typeConf.border} ${typeConf.text}`}>
                  {typeConf.label}
                </span>
              </div>
              <h1 className={`text-sm font-semibold leading-snug ${typeConf.text}`}>
                {exercise.titre}
              </h1>
              {exercise.source && (
                <p className="text-xs text-slate-400 mt-0.5">{exercise.source}</p>
              )}
            </div>
          </div>

          {/* Énoncé */}
          <div className="mt-3 pt-3 border-t border-black/5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Énoncé</p>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{exercise.enonce}</p>
          </div>

          {/* Indications */}
          {exercise.indications && (
            <div className="mt-2.5 rounded-lg bg-white/60 border border-black/5 p-2.5">
              <p className="text-xs font-medium text-slate-500 mb-0.5">💡 Indications</p>
              <p className="text-xs text-slate-600 leading-relaxed">{exercise.indications}</p>
            </div>
          )}
        </div>

      </div>

      <ChatInterface
        initialPrompt={initialPrompt}
        exerciseContext={exerciseContext}
        redirectBase="/chat"
      />
    </div>
  )
}
