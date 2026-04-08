import { neon } from '@neondatabase/serverless'
import type { Domain, Level, ExerciseType } from '@/lib/constants'

const sql = neon(process.env.DATABASE_URL!)

export type Exercise = {
  id: number
  theme: string
  domain: string
  type: 'qcm' | 'vrai_faux' | 'lacunaire' | 'chronologie' | 'association'
  question: string
  options: string[] | null
  answer: string
  explanation: string
  level: 'A' | 'B' | 'C'
  source: string
  created_at: string
}

export type ExerciseAttempt = {
  id: number
  exercise_id: number
  correct: boolean
  time_spent: number | null
  timestamp: string
}

export type AttemptStats = {
  exercise_id: number
  attempt_count: number
  has_correct: boolean
}

export type ExerciseStatus = 'not_started' | 'in_progress' | 'completed'

export function getExerciseStatus(stats: AttemptStats | undefined): ExerciseStatus {
  if (!stats || stats.attempt_count === 0) return 'not_started'
  if (stats.has_correct) return 'completed'
  return 'in_progress'
}

export async function getAttemptStatsByExercises(ids: number[]): Promise<AttemptStats[]> {
  if (ids.length === 0) return []
  const rows = await sql.query(
    `SELECT exercise_id, COUNT(*)::int AS attempt_count, bool_or(correct) AS has_correct
     FROM exercise_attempts
     WHERE exercise_id = ANY($1::int[])
     GROUP BY exercise_id`,
    [ids]
  )
  return rows as AttemptStats[]
}

export async function getExercises(filters: {
  domain?: Domain
  level?: Level
  type?: ExerciseType
  limit?: number
} = {}): Promise<Exercise[]> {
  const { domain, level, type, limit = 20 } = filters
  const conditions: string[] = []
  const params: unknown[] = []
  let i = 1

  if (domain) { conditions.push(`domain = $${i++}`); params.push(domain) }
  if (level) { conditions.push(`level = $${i++}`); params.push(level) }
  if (type) { conditions.push(`type = $${i++}`); params.push(type) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const rows = await sql.query(
    `SELECT * FROM exercises ${where} ORDER BY RANDOM() LIMIT $${i}`,
    [...params, limit]
  )
  return rows as Exercise[]
}

export async function getExerciseById(id: number): Promise<Exercise | null> {
  const rows = await sql.query('SELECT * FROM exercises WHERE id = $1', [id])
  return (rows[0] as Exercise) ?? null
}

export async function saveAttempt(attempt: Omit<ExerciseAttempt, 'id' | 'timestamp'>): Promise<void> {
  await sql.query(
    'INSERT INTO exercise_attempts (exercise_id, correct, time_spent) VALUES ($1, $2, $3)',
    [attempt.exercise_id, attempt.correct, attempt.time_spent]
  )
}

export async function saveExercise(exercise: Omit<Exercise, 'id' | 'created_at'>): Promise<Exercise> {
  const rows = await sql.query(
    `INSERT INTO exercises (theme, domain, type, question, options, answer, explanation, level, source)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [exercise.theme, exercise.domain, exercise.type, exercise.question,
     exercise.options, exercise.answer, exercise.explanation,
     exercise.level, exercise.source]
  )
  return rows[0] as Exercise
}

export type ConversationSummary = {
  id: string
  title: string | null
  created_at: string
  updated_at: string
  message_count: string
}

export type ConversationMessage = {
  id: number
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export async function createConversation(id: string): Promise<void> {
  await sql.query(
    'INSERT INTO conversations (id) VALUES ($1) ON CONFLICT DO NOTHING',
    [id]
  )
}

export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  await sql.query(
    `INSERT INTO conversation_messages (conversation_id, role, content) VALUES ($1, $2, $3)`,
    [conversationId, role, content]
  )
  await sql.query(
    `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
    [conversationId]
  )
}

export async function updateConversationTitle(id: string, title: string): Promise<void> {
  await sql.query(
    'UPDATE conversations SET title = $1 WHERE id = $2',
    [title, id]
  )
}

export async function getConversations(): Promise<ConversationSummary[]> {
  const rows = await sql.query(
    `SELECT c.id, c.title, c.created_at, c.updated_at,
            COUNT(m.id)::text AS message_count
     FROM conversations c
     LEFT JOIN conversation_messages m ON m.conversation_id = c.id
     GROUP BY c.id
     ORDER BY c.updated_at DESC`
  )
  return rows as ConversationSummary[]
}

export async function getConversationMessages(id: string): Promise<ConversationMessage[]> {
  const rows = await sql.query(
    `SELECT * FROM conversation_messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
    [id]
  )
  return rows as ConversationMessage[]
}

export async function deleteConversation(id: string): Promise<void> {
  await sql.query('DELETE FROM conversations WHERE id = $1', [id])
}

export async function getMessageCount(conversationId: string): Promise<number> {
  const rows = await sql.query(
    'SELECT COUNT(*)::int AS count FROM conversation_messages WHERE conversation_id = $1',
    [conversationId]
  )
  return (rows[0] as { count: number }).count
}

export async function hasTitle(conversationId: string): Promise<boolean> {
  const rows = await sql.query(
    'SELECT title FROM conversations WHERE id = $1',
    [conversationId]
  )
  return !!(rows[0] as { title: string | null } | undefined)?.title
}

export type UserProfile = {
  id: number
  exam_date: string | null
  level_langue: 'A' | 'B' | 'C' | null
  level_civi: 'A' | 'B' | 'C' | null
  level_didactique: 'A' | 'B' | 'C' | null
  xp: number
  level_xp: number
  daily_goal_min: number
  created_at: string
}

export type InProgressExercise = {
  id: number
  question: string
  type: string
  domain: string
  level: 'A' | 'B' | 'C'
  attempt_count: number
}

export type ExamSession = {
  id: number
  type: string
  content: string
  ai_feedback: string | null
  score: number | null
  timestamp: string
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const rows = await sql.query('SELECT * FROM user_profile LIMIT 1')
  return (rows[0] as UserProfile) ?? null
}

export async function getTodayMinutes(): Promise<number> {
  const rows = await sql.query(
    `SELECT COALESCE(SUM(duration_min), 0)::int AS total_min
     FROM study_sessions WHERE date = CURRENT_DATE`,
  )
  return (rows[0] as { total_min: number | null }).total_min ?? 0
}

export async function getInProgressExercises(): Promise<InProgressExercise[]> {
  const rows = await sql.query(
    `WITH stats AS (
       SELECT exercise_id,
              COUNT(*)::int AS attempt_count,
              bool_or(correct) AS has_correct,
              MAX(timestamp) AS last_attempt
       FROM exercise_attempts
       GROUP BY exercise_id
     )
     SELECT e.id, e.question, e.type, e.domain, e.level, s.attempt_count
     FROM stats s
     JOIN exercises e ON e.id = s.exercise_id
     WHERE NOT s.has_correct
     ORDER BY s.last_attempt DESC
     LIMIT 5`,
  )
  return rows as InProgressExercise[]
}

export async function getInProgressSimulations(): Promise<ExamSession[]> {
  const rows = await sql.query(
    `SELECT * FROM exam_sessions WHERE ai_feedback IS NULL ORDER BY timestamp DESC LIMIT 3`,
  )
  return rows as ExamSession[]
}

export async function updateDailyGoal(minutes: number): Promise<void> {
  await sql.query('UPDATE user_profile SET daily_goal_min = $1', [minutes])
}
