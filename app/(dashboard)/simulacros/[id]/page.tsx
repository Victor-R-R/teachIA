import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, FileText, Languages, BookOpen } from 'lucide-react'
import { getSimulacroById } from '@/lib/db'
import { SimulacroSession } from '@/components/simulacros/simulacro-session'

const TYPE_META = {
  composition: {
    icon: FileText,
    label: 'Composition',
    hint: 'Dossier documentaire · ~4h · Répondez en espagnol',
    color: 'violet',
  },
  theme: {
    icon: Languages,
    label: 'Thème (FR → ES)',
    hint: 'Traduction française vers espagnol · ~45 min',
    color: 'blue',
  },
  version: {
    icon: BookOpen,
    label: 'Version (ES → FR)',
    hint: 'Traduction espagnole vers français · ~45 min',
    color: 'teal',
  },
} as const

type SimulacroType = keyof typeof TYPE_META

export default async function SimulacroPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idStr } = await params
  const id = parseInt(idStr, 10)
  if (isNaN(id)) notFound()

  const session = await getSimulacroById(id)
  if (!session || !session.subject) notFound()

  const type = (session.type in TYPE_META ? session.type : 'composition') as SimulacroType
  const meta = TYPE_META[type]
  const Icon = meta.icon
  const isDone = session.ai_feedback !== null

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back + header */}
      <div>
        <Link
          href="/simulacros"
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors mb-3"
        >
          <ArrowLeft className="h-3 w-3" />
          Simulacros
        </Link>

        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
            <Icon className="h-4 w-4 text-violet-600" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-900 leading-snug">
              {session.title ?? meta.label}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              {isDone && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
              {isDone ? 'Corrigé' : meta.hint}
            </p>
          </div>
        </div>
      </div>

      {/* Subject */}
      <div className="border border-slate-200 rounded-xl p-5 bg-white">
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Sujet</div>
        <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
          {session.subject}
        </div>
      </div>

      {/* Writing / feedback */}
      <div className="border border-slate-200 rounded-xl p-5 bg-white">
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
          {isDone ? 'Correction' : 'Votre réponse'}
        </div>
        <SimulacroSession
          id={session.id}
          type={session.type}
          initialContent={session.content ?? ''}
          initialFeedback={session.ai_feedback}
          initialScore={session.score}
        />
      </div>
    </div>
  )
}
