'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Trash2, Clock, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { ConversationSummary } from '@/lib/db'
import type { ExerciseType } from '@/lib/exercises'

type EnrichedConversation = ConversationSummary & {
  exercise_title: string | null
  exercise_type: ExerciseType | null
}

type Props = {
  conversations: EnrichedConversation[]
}

const EXERCISE_TYPE_ICON: Record<ExerciseType, string> = {
  composition:  '✍️',
  version:      '🔄',
  theme:        '🌐',
  grammaire:    '📝',
  civilisation: '🏛️',
  didactique:   '🎓',
  lecon:        '🎥',
  entretien:    '💬',
}

function getDisplayTitle(conv: EnrichedConversation): { label: string; icon: React.ReactNode; badge?: string } {
  // Conversation exercice CAPES
  if (conv.capes_exercise_id && conv.exercise_title) {
    const icon = conv.exercise_type ? EXERCISE_TYPE_ICON[conv.exercise_type] : '📚'
    return {
      label: conv.exercise_title,
      icon: <span className="text-base leading-none">{icon}</span>,
      badge: 'Exercice CAPES',
    }
  }

  // Conversation Professeur IA avec titre généré
  if (conv.title) {
    return {
      label: conv.title,
      icon: <MessageCircle className="h-4 w-4 text-violet-500" />,
    }
  }

  // Fallback : premier message utilisateur tronqué
  if (conv.first_user_message) {
    const truncated = conv.first_user_message.length > 60
      ? conv.first_user_message.slice(0, 60).trimEnd() + '…'
      : conv.first_user_message
    return {
      label: truncated,
      icon: <MessageCircle className="h-4 w-4 text-violet-400" />,
    }
  }

  return {
    label: 'Conversation en cours…',
    icon: <MessageCircle className="h-4 w-4 text-slate-400" />,
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  })
}

export function ConversationsList({ conversations }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(conversations)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setItems(prev => prev.filter(c => c.id !== id))
      }
    } catch (e) {
      console.error('[conversations] delete failed:', e)
    } finally {
      setDeleting(null)
      setConfirmId(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-16 text-slate-400">
          <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-base">Aucune conversation enregistrée.</p>
          <p className="text-sm mt-1">
            <a href="/chat" className="text-violet-600 hover:underline">Commence à chatter</a> avec le Professeur IA.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map(conv => {
        const { label, icon, badge } = getDisplayTitle(conv)
        return (
          <Card
            key={conv.id}
            className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => router.push(
              conv.capes_exercise_id
                ? `/exercices/capes/${conv.capes_exercise_id}?id=${conv.id}`
                : `/chat?id=${conv.id}`
            )}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="shrink-0 mt-0.5 flex items-center justify-center h-5 w-5">
                {icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {label}
                  </p>
                  {badge && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
                      <BookOpen className="h-2.5 w-2.5" />
                      {badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(conv.updated_at)}</span>
                  <span>·</span>
                  <span>{conv.message_count} message{Number(conv.message_count) > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            <div onClick={e => e.stopPropagation()}>
              {confirmId === conv.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Supprimer ?</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={deleting === conv.id}
                    onClick={() => handleDelete(conv.id)}
                    className="h-7 px-2 text-xs"
                  >
                    {deleting === conv.id ? 'Suppression…' : 'Oui'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmId(null)}
                    className="h-7 px-2 text-xs"
                  >
                    Non
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmId(conv.id)}
                  className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
                  aria-label="Supprimer la conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
