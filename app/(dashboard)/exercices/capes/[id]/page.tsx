export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getExerciseById } from '@/lib/exercises'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ArrowLeft, GraduationCap } from 'lucide-react'
import Link from 'next/link'

const EXERCISE_TYPE_ICONS: Record<string, React.ReactNode> = {
  composition: <span className="text-base">✍️</span>,
  version: <span className="text-base">🔄</span>,
  theme: <span className="text-base">🌐</span>,
  grammaire: <span className="text-base">📖</span>,
  civilisation: <span className="text-base">🏛️</span>,
  didactique: <span className="text-base">🎓</span>,
  lecon: <span className="text-base">🎥</span>,
  entretien: <span className="text-base">💬</span>,
}

export default async function CapesExercisePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const exercise = getExerciseById(id)

  if (!exercise) notFound()

  const initialPrompt = `Je veux faire l'exercice ${exercise.id} : "${exercise.titre}". Lance-moi cet exercice.`

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="mb-4 shrink-0">
        <Link
          href="/exercices"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour aux exercices
        </Link>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50 border border-violet-100">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-violet-600 text-white shrink-0">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-violet-900 leading-tight">
              {EXERCISE_TYPE_ICONS[exercise.type]} {exercise.titre}
            </h1>
            <p className="text-violet-500 text-xs mt-0.5">Session d&apos;entraînement · Professeur IA</p>
          </div>
        </div>
      </div>
      <ChatInterface
        initialPrompt={initialPrompt}
        redirectBase={`/exercices/capes/${id}`}
      />
    </div>
  )
}
