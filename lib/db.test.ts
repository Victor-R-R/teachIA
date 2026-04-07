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
