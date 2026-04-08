import { getConversations } from '@/lib/db'

export async function GET() {
  try {
    const conversations = await getConversations()
    return Response.json(conversations)
  } catch (e) {
    console.error('[conversations] GET error:', e)
    return new Response(JSON.stringify({ error: 'Failed to fetch conversations' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
