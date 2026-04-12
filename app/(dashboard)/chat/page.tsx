export const dynamic = 'force-dynamic'

import { ChatInterface } from '@/components/chat/chat-interface'
import { getConversationMessages } from '@/lib/db'
import { getEffectiveUserId } from '@/lib/session'
import { getExerciseById } from '@/lib/exercises'
import type { UIMessage } from 'ai'
import { Bot, Sparkles, GraduationCap } from 'lucide-react'

type Props = {
  searchParams: Promise<{ id?: string; exercise?: string }>
}

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

export default async function ChatPage({ searchParams }: Props) {
  const { id, exercise: exerciseId } = await searchParams

  let initialMessages: UIMessage[] = []
  if (id) {
    try {
      const messages = await getConversationMessages(id)
      initialMessages = messages.map(m => ({
        id: String(m.id),
        role: m.role as 'user' | 'assistant',
        parts: [{ type: 'text' as const, text: m.content }],
      }))
    } catch {
      // Conversation not found — start fresh
    }
  }

  const exercise = exerciseId ? getExerciseById(exerciseId) : undefined
  const initialPrompt = exercise
    ? `Je veux faire l'exercice ${exercise.id} : "${exercise.titre}". Lance-moi cet exercice.`
    : undefined

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="mb-4 shrink-0">
        {exercise ? (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50 border border-violet-100">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-violet-600 text-white shrink-0">
              <GraduationCap className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-violet-900 leading-tight">
                {EXERCISE_TYPE_ICONS[exercise.type]} {exercise.titre}
              </h1>
              <p className="text-violet-500 text-xs mt-0.5">Session d'entraînement · Professeur IA</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white shrink-0">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-1.5">
                Professeur IA
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              </h1>
              <p className="text-slate-400 text-xs">Pose n&apos;importe quelle question sur le CAPES d&apos;espagnol.</p>
            </div>
          </div>
        )}
      </div>
      <ChatInterface conversationId={id} initialMessages={initialMessages} initialPrompt={initialPrompt} />
    </div>
  )
}
