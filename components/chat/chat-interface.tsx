'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2 } from 'lucide-react'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import type { UIMessage } from 'ai'


type Props = {
  conversationId?: string
  initialMessages?: UIMessage[]
  initialPrompt?: string
}

export function ChatInterface({ conversationId: initialId, initialMessages = [], initialPrompt }: Props) {
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const convId = useRef<string>(initialId ?? nanoid())
  const initSent = useRef(initialMessages.length > 0 || !initialPrompt)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { conversationId: convId.current },
    }),
    messages: initialMessages,
  })

  useEffect(() => {
    if (!initialId) {
      router.replace(`/chat?id=${convId.current}`)
    }
  }, [initialId, router])

  useEffect(() => {
    if (!initSent.current && initialPrompt) {
      initSent.current = true
      sendMessage({ text: initialPrompt }).catch(console.error)
    }
  }, [sendMessage, initialPrompt])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isStreaming = status === 'streaming' || status === 'submitted'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isStreaming) return
    sendMessage({ text: input })
    setInput('')
  }

  const visibleMessages = messages.filter(m => {
    if (m.role !== 'user') return true
    const text = m.parts?.find(p => p.type === 'text')?.text
    return text !== INIT_MARKER
  })

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {visibleMessages.map(message => (
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
