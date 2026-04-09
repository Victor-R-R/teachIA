import { neon } from '@neondatabase/serverless'

function getDb() {
  return neon(process.env.DATABASE_URL!)
}

export type AdminUser = {
  id: string
  name: string | null
  email: string
  image: string | null
  role: 'student' | 'superadmin'
  blocked: boolean
  created_at: Date
  xp: number | null
  level_xp: number | null
}

export type UserDetail = {
  user: Omit<AdminUser, 'xp' | 'level_xp'>
  profile: { xp: number; level_xp: number; level_langue: string | null; level_civi: string | null; level_didactique: string | null } | null
  stats: { total: number; correct: number }
}

export async function listUsers(): Promise<AdminUser[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT u.id, u.name, u.email, u.image, u.role, u.blocked, u.created_at,
           p.xp, p.level_xp
    FROM users u
    LEFT JOIN user_profile p ON p.user_id = u.id
    ORDER BY u.created_at DESC
  `
  return rows as AdminUser[]
}

export async function getUserDetail(userId: string): Promise<UserDetail | null> {
  const sql = getDb()
  const users = await sql`SELECT id, name, email, image, role, blocked, created_at FROM users WHERE id = ${userId}`
  if (users.length === 0) return null
  const profiles = await sql`SELECT xp, level_xp, level_langue, level_civi, level_didactique FROM user_profile WHERE user_id = ${userId}`
  const stats = await sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE correct) as correct FROM exercise_attempts WHERE user_id = ${userId}`
  return {
    user: users[0] as UserDetail['user'],
    profile: profiles[0] ?? null,
    stats: { total: Number(stats[0].total), correct: Number(stats[0].correct) },
  }
}

export async function blockUser(userId: string): Promise<void> {
  const sql = getDb()
  await sql`UPDATE users SET blocked = true WHERE id = ${userId}`
}

export async function unblockUser(userId: string): Promise<void> {
  const sql = getDb()
  await sql`UPDATE users SET blocked = false WHERE id = ${userId}`
}

export async function deleteUser(userId: string): Promise<void> {
  const sql = getDb()
  await sql`DELETE FROM users WHERE id = ${userId}`
}

export async function getAppSettings(): Promise<Record<string, string>> {
  const sql = getDb()
  const rows = await sql`SELECT key, value FROM app_settings ORDER BY key`
  return Object.fromEntries(rows.map((r: any) => [r.key, r.value]))
}

export async function updateAppSetting(key: string, value: string): Promise<void> {
  const sql = getDb()
  await sql`
    INSERT INTO app_settings (key, value, updated_at) VALUES (${key}, ${value}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `
}

export async function getAdminStats(): Promise<{
  totalUsers: number
  activeToday: number
  totalAttempts: number
  correctAttempts: number
}> {
  const sql = getDb()
  const userStats = await sql`
    SELECT COUNT(*) as total_users,
           COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as active_today
    FROM users
  `
  const attemptStats = await sql`
    SELECT COUNT(*) as total_attempts,
           COUNT(*) FILTER (WHERE correct) as correct_attempts
    FROM exercise_attempts
  `
  return {
    totalUsers: Number(userStats[0].total_users),
    activeToday: Number(userStats[0].active_today),
    totalAttempts: Number(attemptStats[0].total_attempts),
    correctAttempts: Number(attemptStats[0].correct_attempts),
  }
}
