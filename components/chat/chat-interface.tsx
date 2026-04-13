'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRef, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2, Clock } from 'lucide-react'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import type { UIMessage } from 'ai'

const DEFAULT_RETRY_DELAY = 30

function isRetryableError(err: Error) {
  return (
    err.message.includes('high demand') ||
    err.message.includes('UNAVAILABLE') ||
    err.message.includes('503') ||
    err.message.includes('quota') ||
    err.message.includes('Quota')
  )
}

function parseRetryDelay(err: Error): number {
  const match = err.message.match(/retry in ([\d.]+)s/i)
  if (match) return Math.ceil(parseFloat(match[1]))
  return DEFAULT_RETRY_DELAY
}

type Props = {
  conversationId?: string
  initialMessages?: UIMessage[]
  initialPrompt?: string
  exerciseContext?: string
  capesExerciseId?: string
  redirectBase?: string
}

export function ChatInterface({ conversationId: initialId, initialMessages = [], initialPrompt, exerciseContext, capesExerciseId, redirectBase = '/chat' }: Props) {
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const convId = useRef<string>(initialId ?? nanoid())
  const lastTextRef = useRef<string>('')
  const [countdown, setCountdown] = useState<number | null>(null)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { conversationId: convId.current, exerciseContext, capesExerciseId },
    }),
    messages: initialMessages,
  })

  useEffect(() => {
    if (!initialId) {
      router.replace(`${redirectBase}?id=${convId.current}`)
    }
  }, [initialId, redirectBase, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Démarrer le countdown sur erreur retryable
  useEffect(() => {
    if (error && isRetryableError(error)) {
      setCountdown(parseRetryDelay(error))
    }
  }, [error])

  // Décrémenter le countdown
  useEffect(() => {
    if (countdown === null || countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => (c ?? 1) - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Réessai automatique quand countdown atteint 0
  const doRetry = useCallback(() => {
    if (!lastTextRef.current) return
    setCountdown(null)
    sendMessage({ text: lastTextRef.current })
  }, [sendMessage])

  useEffect(() => {
    if (countdown === 0) doRetry()
  }, [countdown, doRetry])

  const isStreaming = status === 'streaming' || status === 'submitted'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isStreaming) return
    const text = messages.length === 0 && initialPrompt
      ? `${initialPrompt}\n\n---\n\nMa réponse : ${input}`
      : input
    lastTextRef.current = text
    setCountdown(null)
    sendMessage({ text })
    setInput('')
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {error && (
          <div className="text-sm bg-red-50 border border-red-200 rounded-lg p-3">
            {countdown !== null && countdown > 0 ? (
              <div className="flex items-center gap-2 text-amber-700">
                <Clock className="h-4 w-4 shrink-0" />
                <span>Le modèle est surchargé — réessai automatique dans <strong>{countdown}s</strong></span>
              </div>
            ) : countdown === 0 ? (
              <div className="flex items-center gap-2 text-amber-700">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                <span>Réessai en cours…</span>
              </div>
            ) : (
              <span className="text-red-600">{error.message}</span>
            )}
          </div>
        )}
        {messages.length === 0 && (exerciseContext || initialPrompt) && (
          <div className="flex items-center justify-center h-full py-8">
            <p className="text-sm text-slate-400 text-center">
              ✍️ Écris ta réponse ci-dessous pour commencer l&apos;exercice
            </p>
          </div>
        )}
        {messages.map(message => (
          <Message key={message.id} from={message.role}>
            <MessageContent>
              {message.parts?.map((part, index) =>
                part.type === 'text' ? (
                  <MessageResponse key={index}>{part.text}</MessageResponse>
                ) : null
              ) ?? null}
            </MessageContent>
          </Message>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 bg-white border-t border-slate-200 pt-3 pb-3 flex gap-2"
      >
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Pose une question à ton professeur…"
          disabled={isStreaming}
          className="flex-1 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
        />
        <Button
          type="submit"
          disabled={!input.trim() || isStreaming}
          aria-label={isStreaming ? 'Envoi en cours…' : 'Envoyer'}
          className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 px-3"
        >
          {isStreaming
            ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            : <Send className="h-4 w-4" aria-hidden="true" />
          }
        </Button>
      </form>
    </div>
  )
}
