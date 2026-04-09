export const dynamic = 'force-dynamic'

import { getConversations } from '@/lib/db'
import { getEffectiveUserId } from '@/lib/session'
import { ConversationsList } from '@/components/conversations/conversations-list'

export default async function ConversationsPage() {
  const userId = await getEffectiveUserId()
  const conversations = await getConversations(userId)
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Conversations</h1>
        <p className="text-slate-500 text-sm">Retrouve et reprends tes sessions passées avec le Professeur IA.</p>
      </div>
      <ConversationsList conversations={conversations} />
    </div>
  )
}
