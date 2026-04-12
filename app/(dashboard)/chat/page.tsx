export const dynamic = 'force-dynamic'

import { ChatInterface } from '@/components/chat/chat-interface'
import { getConversationMessages } from '@/lib/db'
import { getEffectiveUserId } from '@/lib/session'
import { getExerciseById } from '@/lib/exercises'
import type { UIMessage } from 'ai'

type Props = {
  searchParams: Promise<{ id?: string; exercise?: string }>
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
        <h1 className="text-2xl font-semibold text-slate-900">Professeur IA</h1>
        <p className="text-slate-500 text-sm">
          {exercise ? `Exercice : ${exercise.titre}` : "Pose n'importe quelle question sur le CAPES d'espagnol."}
        </p>
      </div>
      <ChatInterface conversationId={id} initialMessages={initialMessages} initialPrompt={initialPrompt} />
    </div>
  )
}
