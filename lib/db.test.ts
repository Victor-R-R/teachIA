import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock neon before importing db
vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => vi.fn()),
}))

describe('db helpers', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('getExercises builds query without filters', async () => {
    const { neon } = await import('@neondatabase/serverless')
    const mockSql = vi.fn().mockResolvedValue([])
    vi.mocked(neon).mockReturnValue(mockSql as any)

    const { getExercises } = await import('./db')
    await getExercises()

    expect(mockSql).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM exercises'),
      expect.any(Array)
    )
  })

  it('getExerciseById queries by id', async () => {
    const { neon } = await import('@neondatabase/serverless')
    const mockExercise = { id: 1, question: 'Test?', answer: 'A' }
    const mockSql = vi.fn().mockResolvedValue([mockExercise])
    vi.mocked(neon).mockReturnValue(mockSql as any)

    const { getExerciseById } = await import('./db')
    const result = await getExerciseById(1)

    expect(result).toEqual(mockExercise)
    expect(mockSql).toHaveBeenCalledWith(
      'SELECT * FROM exercises WHERE id = $1',
      [1]
    )
  })
})
