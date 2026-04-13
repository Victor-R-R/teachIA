export const dynamic = 'force-dynamic'

import { getConversations } from '@/lib/db'
import { getEffectiveUserId } from '@/lib/session'
import { ConversationsList } from '@/components/conversations/conversations-list'
import { getExerciseById } from '@/lib/exercises'

export default async function ConversationsPage() {
  const userId = await getEffectiveUserId()
  const conversations = await getConversations(userId)

  const enriched = conversations.map(conv => {
    if (conv.capes_exercise_id) {
      const exercise = getExerciseById(conv.capes_exercise_id)
      return {
        ...conv,
        exercise_title: exercise ? `${exercise.titre}` : null,
        exercise_type: exercise?.type ?? null,
      }
    }
    return { ...conv, exercise_title: null, exercise_type: null }
  })

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Conversations</h1>
        <p className="text-slate-500 text-sm">Retrouve et reprends tes sessions passées avec le Professeur IA.</p>
      </div>
      <ConversationsList conversations={enriched} />
    </div>
  )
}
