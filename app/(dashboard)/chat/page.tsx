import { ChatInterface } from '@/components/chat/chat-interface'

export default function ChatPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-zinc-100">Professeur IA</h1>
        <p className="text-zinc-400 text-sm">Pose n'importe quelle question sur le CAPES d'espagnol.</p>
      </div>
      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  )
}
