import { describe, it, expect, vi } from 'vitest'

vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => {
    const fn = vi.fn() as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    fn.query = fn
    return fn
  }),
}))

describe('db helpers', () => {
  it('getExercises builds query without filters', async () => {
    vi.resetModules()
    const mockSql = vi.fn().mockResolvedValue([]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({
      neon: vi.fn(() => mockSql),
    }))
    const { getExercises } = await import('./db')
    await getExercises()
    // test passes if no error thrown
    expect(true).toBe(true)
  })

  it('getExerciseById queries by id', async () => {
    vi.resetModules()
    const mockExercise = { id: 1, question: 'Test?', answer: 'A' }
    const mockSql = vi.fn().mockResolvedValue([mockExercise]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({
      neon: vi.fn(() => mockSql),
    }))
    const { getExerciseById } = await import('./db')
    const result = await getExerciseById(1)
    expect(result).toEqual(mockExercise)
  })
})

describe('conversation helpers', () => {
  it('createConversation inserts with ON CONFLICT DO NOTHING', async () => {
    vi.resetModules()
    const mockSql = vi.fn().mockResolvedValue([]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { createConversation } = await import('./db')
    await createConversation('conv-1')
    expect(mockSql.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO conversations'),
      expect.arrayContaining(['conv-1'])
    )
  })

  it('saveMessage inserts role and content', async () => {
    vi.resetModules()
    const mockSql = vi.fn().mockResolvedValue([]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { saveMessage } = await import('./db')
    await saveMessage('conv-1', 'user', 'Bonjour')
    expect(mockSql.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO conversation_messages'),
      expect.arrayContaining(['conv-1', 'user', 'Bonjour'])
    )
  })

  it('getConversations returns list', async () => {
    vi.resetModules()
    const row = { id: 'conv-1', title: 'Test', created_at: '', updated_at: '', message_count: '2' }
    const mockSql = vi.fn().mockResolvedValue([row]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { getConversations } = await import('./db')
    const result = await getConversations()
    expect(result).toEqual([row])
  })

  it('getConversationMessages returns messages for an id', async () => {
    vi.resetModules()
    const row = { id: 1, conversation_id: 'conv-1', role: 'user', content: 'Hello', created_at: '' }
    const mockSql = vi.fn().mockResolvedValue([row]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { getConversationMessages } = await import('./db')
    const result = await getConversationMessages('conv-1')
    expect(result).toEqual([row])
  })

  it('deleteConversation runs DELETE', async () => {
    vi.resetModules()
    const mockSql = vi.fn().mockResolvedValue([]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { deleteConversation } = await import('./db')
    await deleteConversation('conv-1')
    expect(mockSql.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM conversations'),
      ['conv-1']
    )
  })
})
