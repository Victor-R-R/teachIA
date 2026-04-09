import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock neon
vi.mock('@neondatabase/serverless', () => ({
  neon: vi.fn(() => vi.fn()),
}))

import { neon } from '@neondatabase/serverless'
import {
  listUsers,
  getUserDetail,
  blockUser,
  unblockUser,
  deleteUser,
  getAppSettings,
  updateAppSetting,
  getAdminStats,
} from './admin-db'

const mockSql = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(neon).mockReturnValue(mockSql as any)
})

describe('listUsers', () => {
  it('returns list of users with basic info', async () => {
    mockSql.mockResolvedValueOnce([
      { id: 'u1', name: 'Alice', email: 'alice@test.com', image: null, role: 'student', blocked: false, created_at: new Date('2026-01-01T00:00:00Z'), xp: 100, level_xp: 2 },
    ])
    const result = await listUsers()
    expect(result).toHaveLength(1)
    expect(result[0].email).toBe('alice@test.com')
    expect(result[0].xp).toBe(100)
  })
})

describe('getUserDetail', () => {
  it('returns user with profile and stats', async () => {
    mockSql
      .mockResolvedValueOnce([{ id: 'u1', name: 'Alice', email: 'alice@test.com', image: null, role: 'student', blocked: false, created_at: new Date('2026-01-01T00:00:00Z') }])
      .mockResolvedValueOnce([{ xp: 100, level_xp: 2, level_langue: 'B', level_civi: 'A', level_didactique: 'C' }])
      .mockResolvedValueOnce([{ total: '50', correct: '35' }])
    const result = await getUserDetail('u1')
    expect(result?.user.email).toBe('alice@test.com')
    expect(result?.profile?.xp).toBe(100)
    expect(result?.stats.total).toBe(50)
    expect(result?.stats.correct).toBe(35)
  })

  it('returns null if user not found', async () => {
    mockSql.mockResolvedValueOnce([])
    const result = await getUserDetail('nonexistent')
    expect(result).toBeNull()
  })
})

describe('blockUser / unblockUser', () => {
  it('sets blocked to true', async () => {
    mockSql.mockResolvedValueOnce([])
    await blockUser('u1')
    expect(mockSql).toHaveBeenCalledOnce()
  })

  it('sets blocked to false', async () => {
    mockSql.mockResolvedValueOnce([])
    await unblockUser('u1')
    expect(mockSql).toHaveBeenCalledOnce()
  })
})

describe('deleteUser', () => {
  it('deletes user by id', async () => {
    mockSql.mockResolvedValueOnce([])
    await deleteUser('u1')
    expect(mockSql).toHaveBeenCalledOnce()
  })
})

describe('getAppSettings', () => {
  it('returns all settings as key-value object', async () => {
    mockSql.mockResolvedValueOnce([
      { key: 'xp_gain_A', value: '30' },
      { key: 'xp_gain_B', value: '20' },
    ])
    const result = await getAppSettings()
    expect(result).toEqual({ xp_gain_A: '30', xp_gain_B: '20' })
  })
})

describe('updateAppSetting', () => {
  it('upserts a setting', async () => {
    mockSql.mockResolvedValueOnce([])
    await updateAppSetting('xp_gain_A', '35')
    expect(mockSql).toHaveBeenCalledOnce()
  })
})

describe('getAdminStats', () => {
  it('returns aggregate stats', async () => {
    mockSql
      .mockResolvedValueOnce([{ total_users: '10', active_today: '3' }])
      .mockResolvedValueOnce([{ total_attempts: '500', correct_attempts: '380' }])
    const result = await getAdminStats()
    expect(result.totalUsers).toBe(10)
    expect(result.activeToday).toBe(3)
    expect(result.totalAttempts).toBe(500)
    expect(result.correctAttempts).toBe(380)
  })
})
