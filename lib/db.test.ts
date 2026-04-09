import { describe, it, expect, vi } from 'vitest'

vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => {
    const fn = vi.fn() as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    fn.query = fn
    return fn
  }),
}))

const TEST_USER = 'user-test-123'

describe('db helpers', () => {
  it('getExercises builds query without filters', async () => {
    vi.resetModules()
    const mockSql = vi.fn().mockResolvedValue([]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({
      neon: vi.fn(() => mockSql),
    }))
    const { getExercises } = await import('./db')
    await getExercises(TEST_USER)
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
    await createConversation(TEST_USER, 'conv-1')
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
    const result = await getConversations(TEST_USER)
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

describe('gamification helpers', () => {
  it('getUserProfile returns null when table empty', async () => {
    vi.resetModules()
    const mockSql = vi.fn().mockResolvedValue([]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { getUserProfile } = await import('./db')
    const result = await getUserProfile(TEST_USER)
    expect(result).toBeNull()
  })

  it('getUserProfile returns profile when exists', async () => {
    vi.resetModules()
    const profile = { id: 1, xp: 420, level_xp: 3, daily_goal_min: 60 }
    const mockSql = vi.fn().mockResolvedValue([profile]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { getUserProfile } = await import('./db')
    const result = await getUserProfile(TEST_USER)
    expect(result).toEqual(profile)
  })

  it('getTodayMinutes returns 0 when no sessions', async () => {
    vi.resetModules()
    const mockSql = vi.fn().mockResolvedValue([{ total_min: null }]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { getTodayMinutes } = await import('./db')
    const result = await getTodayMinutes(TEST_USER)
    expect(result).toBe(0)
  })

  it('getTodayMinutes sums duration_min for today', async () => {
    vi.resetModules()
    const mockSql = vi.fn().mockResolvedValue([{ total_min: 37 }]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { getTodayMinutes } = await import('./db')
    const result = await getTodayMinutes(TEST_USER)
    expect(result).toBe(37)
  })

  it('getInProgressExercises returns exercises with attempts but no correct', async () => {
    vi.resetModules()
    const row = { id: 5, question: 'Q?', type: 'qcm', domain: 'langue', level: 'B', attempt_count: 2 }
    const mockSql = vi.fn().mockResolvedValue([row]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { getInProgressExercises } = await import('./db')
    const result = await getInProgressExercises(TEST_USER)
    expect(result).toEqual([row])
  })

  it('getInProgressSimulations returns exam_sessions without ai_feedback', async () => {
    vi.resetModules()
    const row = { id: 1, type: 'traduction', content: '...', ai_feedback: null, score: null, timestamp: '' }
    const mockSql = vi.fn().mockResolvedValue([row]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { getInProgressSimulations } = await import('./db')
    const result = await getInProgressSimulations(TEST_USER)
    expect(result).toEqual([row])
  })

  it('saveAttempt does not update XP on incorrect answer', async () => {
    vi.resetModules()
    const mockSql = vi.fn().mockResolvedValue([]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { saveAttempt } = await import('./db')
    await saveAttempt(TEST_USER, { exercise_id: 1, correct: false, time_spent: null, exercise_level: 'B', exercise_domain: 'langue' })
    const calls = mockSql.query.mock.calls.map((c: unknown[]) => (c[0] as string).trim())
    expect(calls.some((q: string) => q.includes('UPDATE user_profile') && q.includes('xp'))).toBe(false)
  })

  it('saveAttempt increments XP on correct answer', async () => {
    vi.resetModules()
    const mockSql = vi.fn()
      .mockResolvedValueOnce([])  // INSERT attempt
      .mockResolvedValueOnce([{ xp: 20, level_xp: 1 }]) // UPDATE xp RETURNING
      .mockResolvedValue([{ total: 1, correct_count: 1 }]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { saveAttempt } = await import('./db')
    await saveAttempt(TEST_USER, { exercise_id: 1, correct: true, time_spent: null, exercise_level: 'B', exercise_domain: 'langue' })
    const calls = mockSql.query.mock.calls.map((c: unknown[]) => (c[0] as string).trim())
    expect(calls.some((q: string) => q.includes('UPDATE user_profile') && q.includes('xp = xp +'))).toBe(true)
  })

  it('saveAttempt upserts study_sessions when time_spent is set', async () => {
    vi.resetModules()
    const mockSql = vi.fn()
      .mockResolvedValueOnce([]) // INSERT attempt
      .mockResolvedValueOnce([]) // upsert study_sessions
      .mockResolvedValue([{ xp: 10, level_xp: 1 }]) as ReturnType<typeof vi.fn> & { query: ReturnType<typeof vi.fn> }
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { saveAttempt } = await import('./db')
    await saveAttempt(TEST_USER, { exercise_id: 1, correct: true, time_spent: 120, exercise_level: 'C', exercise_domain: 'langue' })
    const calls = mockSql.query.mock.calls.map((c: unknown[]) => (c[0] as string).trim())
    expect(calls.some((q: string) => q.includes('INSERT INTO study_sessions'))).toBe(true)
  })
})

// Flux : le niveau de domaine monte à chaque réponse correcte (visible sur /dashboard)
describe('domain level progression (dashboard flow)', () => {
  // Helper : simule saveAttempt avec des stats de tentatives données
  async function callSaveAttemptWithStats(total: number, correct_count: number) {
    vi.resetModules()
    const mockSql = vi.fn()
      .mockResolvedValueOnce([])                          // INSERT attempt
      .mockResolvedValueOnce([{ xp: 50, level_xp: 1 }]) // UPDATE xp RETURNING
      .mockResolvedValueOnce([{ total, correct_count }]) // SELECT stats domaine
      .mockResolvedValue([])                              // UPDATE level (si total >= 5)
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { saveAttempt } = await import('./db')
    await saveAttempt(TEST_USER, { exercise_id: 1, correct: true, time_spent: null, exercise_level: 'B', exercise_domain: 'langue' })
    return mockSql.query.mock.calls.map((c: unknown[]) => ({ sql: (c[0] as string).trim(), params: c[1] }))
  }

  it('ne met pas à jour le niveau si moins de 5 tentatives', async () => {
    const calls = await callSaveAttemptWithStats(4, 4)
    const levelUpdate = calls.find(c => c.sql.includes('UPDATE user_profile SET level_'))
    expect(levelUpdate).toBeUndefined()
  })

  it('niveau A quand taux correct < 50% (4/10 = 40%)', async () => {
    const calls = await callSaveAttemptWithStats(10, 4)
    const levelUpdate = calls.find(c => c.sql.includes('UPDATE user_profile SET level_langue'))
    expect(levelUpdate).toBeDefined()
    expect(levelUpdate!.params).toContain('A')
  })

  it('niveau B quand taux correct entre 50% et 79% (6/10 = 60%)', async () => {
    const calls = await callSaveAttemptWithStats(10, 6)
    const levelUpdate = calls.find(c => c.sql.includes('UPDATE user_profile SET level_langue'))
    expect(levelUpdate).toBeDefined()
    expect(levelUpdate!.params).toContain('B')
  })

  it('niveau C quand taux correct >= 80% (8/10 = 80%)', async () => {
    const calls = await callSaveAttemptWithStats(10, 8)
    const levelUpdate = calls.find(c => c.sql.includes('UPDATE user_profile SET level_langue'))
    expect(levelUpdate).toBeDefined()
    expect(levelUpdate!.params).toContain('C')
  })

  it('met à jour level_civi pour le domaine civi_espagne', async () => {
    vi.resetModules()
    const mockSql = vi.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ xp: 50, level_xp: 1 }])
      .mockResolvedValueOnce([{ total: 10, correct_count: 9 }])
      .mockResolvedValue([])
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { saveAttempt } = await import('./db')
    await saveAttempt(TEST_USER, { exercise_id: 2, correct: true, time_spent: null, exercise_level: 'A', exercise_domain: 'civi_espagne' })
    const calls = mockSql.query.mock.calls.map((c: unknown[]) => (c[0] as string).trim())
    expect(calls.some((q: string) => q.includes('level_civi'))).toBe(true)
  })

  it('met à jour level_didactique pour le domaine didactique', async () => {
    vi.resetModules()
    const mockSql = vi.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ xp: 50, level_xp: 1 }])
      .mockResolvedValueOnce([{ total: 10, correct_count: 5 }])
      .mockResolvedValue([])
    mockSql.query = mockSql
    vi.doMock('@neondatabase/serverless', () => ({ neon: vi.fn(() => mockSql) }))
    const { saveAttempt } = await import('./db')
    await saveAttempt(TEST_USER, { exercise_id: 3, correct: true, time_spent: null, exercise_level: 'B', exercise_domain: 'didactique' })
    const calls = mockSql.query.mock.calls.map((c: unknown[]) => (c[0] as string).trim())
    expect(calls.some((q: string) => q.includes('level_didactique'))).toBe(true)
  })

  it('flux complet : A → B → C au fur et à mesure des bonnes réponses', async () => {
    // Simule 3 états successifs du profil tel que /dashboard le verrait
    const scenarios: Array<{ total: number; correct_count: number; expectedLevel: 'A' | 'B' | 'C' }> = [
      { total: 5,  correct_count: 2,  expectedLevel: 'A' }, // 40% → A
      { total: 10, correct_count: 6,  expectedLevel: 'B' }, // 60% → B
      { total: 20, correct_count: 16, expectedLevel: 'C' }, // 80% → C
    ]

    for (const { total, correct_count, expectedLevel } of scenarios) {
      const calls = await callSaveAttemptWithStats(total, correct_count)
      const levelUpdate = calls.find(c => c.sql.includes('UPDATE user_profile SET level_langue'))
      expect(levelUpdate, `niveau attendu ${expectedLevel} pour ${correct_count}/${total}`).toBeDefined()
      expect(levelUpdate!.params).toContain(expectedLevel)
    }
  })
})
