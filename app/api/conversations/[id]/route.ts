import { getConversationMessages, deleteConversation } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const messages = await getConversationMessages(id)
    const uiMessages = messages.map(m => ({
      id: String(m.id),
      role: m.role,
      parts: [{ type: 'text' as const, text: m.content }],
    }))
    return Response.json(uiMessages)
  } catch (e) {
    console.error('[conversations/id] GET error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch messages' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await deleteConversation(id)
    return new Response(null, { status: 204 })
  } catch (e) {
    console.error('[conversations/id] DELETE error:', e)
    return new Response(JSON.stringify({ error: 'Failed to delete conversation' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
