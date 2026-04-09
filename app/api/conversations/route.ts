import { getConversations } from '@/lib/db'
import { getEffectiveUserId } from '@/lib/session'

export async function GET() {
  try {
    const userId = await getEffectiveUserId()
    const conversations = await getConversations(userId)
    return Response.json(conversations)
  } catch (e) {
    console.error('[conversations] GET error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch conversations' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
