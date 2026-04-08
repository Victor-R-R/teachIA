'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2 } from 'lucide-react'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'

const INIT_MARKER = '[[INIT]]'

export function ChatInterface() {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const initSent = useRef(false)
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  useEffect(() => {
    if (!initSent.current) {
      initSent.current = true
      sendMessage({ text: INIT_MARKER }).catch(console.error)
    }
  }, [sendMessage])

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

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-6rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages
          .filter(m => {
            if (m.role !== 'user') return true
            const text = m.parts?.find(p => p.type === 'text')?.text
            return text !== INIT_MARKER
          })
          .map(message => (
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

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t border-slate-200">
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
