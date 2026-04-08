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

export function ChatInterface() {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

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
        {messages.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg mb-2">¡Hola! Je suis ton professeur IA.</p>
            <p className="text-sm">Pose-moi une question sur la grammaire, la civilisation, la littérature ou la didactique.</p>
          </div>
        )}
        {messages.map(message => (
          <Message key={message.id} from={message.role}>
            <MessageContent>
              {message.parts.map((part, index) =>
                part.type === 'text' ? (
                  <MessageResponse key={index}>{part.text}</MessageResponse>
                ) : null
              )}
            </MessageContent>
          </Message>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t border-zinc-800">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Pose une question à ton professeur…"
          disabled={isStreaming}
          className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />
        <Button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 px-3"
        >
          {isStreaming
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />
          }
        </Button>
      </form>
    </div>
  )
}
