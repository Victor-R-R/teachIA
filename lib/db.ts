import { neon } from '@neondatabase/serverless'
import type { Domain, Level, ExerciseType } from '@/lib/constants'

const sql = neon(process.env.DATABASE_URL!)

export type QuestionItem = {
  type: 'qcm' | 'vrai_faux' | 'lacunaire'
  question: string
  options: string[] | null
  answer: string
  explanation: string
}

export type Exercise = {
  id: number
  theme: string
  domain: string
  title: string | null
  type: 'qcm' | 'vrai_faux' | 'lacunaire' | 'chronologie' | 'association'
  question: string
  options: string[] | null
  answer: string
  explanation: string
  level: 'A' | 'B' | 'C'
  source: string
  questions: QuestionItem[] | null
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

export async function saveAttempt(attempt: {
  exercise_id: number
  correct: boolean
  time_spent: number | null
  exercise_level: 'A' | 'B' | 'C'
  exercise_domain: string
}): Promise<void> {
  const { exercise_id, correct, time_spent, exercise_level, exercise_domain } = attempt

  // 1. Enregistrer la tentative
  await sql.query(
    'INSERT INTO exercise_attempts (exercise_id, correct, time_spent) VALUES ($1, $2, $3)',
    [exercise_id, correct, time_spent]
  )

  // 2. Mettre à jour study_sessions (si durée > 0)
  if (time_spent !== null) {
    const durationMin = Math.floor(time_spent / 60)
    if (durationMin > 0) {
      await sql.query(
        `INSERT INTO study_sessions (date, domain, duration_min, exercises_done, correct_count)
         VALUES (CURRENT_DATE, $1, $2, 1, $3)
         ON CONFLICT (date, domain) DO UPDATE SET
           duration_min = study_sessions.duration_min + EXCLUDED.duration_min,
           exercises_done = study_sessions.exercises_done + 1,
           correct_count = study_sessions.correct_count + EXCLUDED.correct_count`,
        [exercise_domain, durationMin, correct ? 1 : 0]
      )
    }
  }

  // 3. Arrêt si réponse incorrecte
  if (!correct) return

  // 4. Incrémenter XP
  const xpGain: Record<'A' | 'B' | 'C', number> = { A: 30, B: 20, C: 10 }
  const gain = xpGain[exercise_level]
  const rows = await sql.query(
    'UPDATE user_profile SET xp = xp + $1 RETURNING xp, level_xp',
    [gain]
  )
  if (rows.length === 0) return

  const { xp: newXp, level_xp: currentLevel } = rows[0] as { xp: number; level_xp: number }
  const nextThreshold = (currentLevel + 1) * (currentLevel + 1) * 100
  if (newXp >= nextThreshold) {
    await sql.query('UPDATE user_profile SET level_xp = level_xp + 1')
  }

  // 5. Recalculer le niveau A/B/C du domaine
  const domainGroup =
    exercise_domain === 'langue'
      ? ['langue']
      : exercise_domain === 'civi_espagne' || exercise_domain === 'civi_latam'
        ? ['civi_espagne', 'civi_latam']
        : ['didactique']

  const levelColumn =
    exercise_domain === 'langue'
      ? 'level_langue'
      : exercise_domain === 'civi_espagne' || exercise_domain === 'civi_latam'
        ? 'level_civi'
        : 'level_didactique'

  const statRows = await sql.query(
    `SELECT COUNT(*)::int AS total,
            SUM(CASE WHEN ea.correct THEN 1 ELSE 0 END)::int AS correct_count
     FROM (
       SELECT ea.correct
       FROM exercise_attempts ea
       JOIN exercises e ON e.id = ea.exercise_id
       WHERE e.domain = ANY($1)
       ORDER BY ea.timestamp DESC
       LIMIT 20
     ) ea`,
    [domainGroup]
  )

  const { total, correct_count } = statRows[0] as { total: number; correct_count: number }
  if (total >= 5) {
    const pct = correct_count / total
    const newLevel = pct >= 0.8 ? 'C' : pct >= 0.5 ? 'B' : 'A'
    await sql.query(`UPDATE user_profile SET ${levelColumn} = $1`, [newLevel])
  }
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
  title: string | null
  subject: string | null
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

// ─── Flashcards ───────────────────────────────────────────────────────────────

export type Flashcard = {
  id: number
  front: string
  back: string
  domain: string
  level: 'A' | 'B' | 'C'
  source: string
  created_at: string
}

export type FlashcardReviewStat = {
  flashcard_id: number
  total: number
  known_count: number
  last_known: boolean | null
}

export async function getFlashcards(filters: {
  domain?: Domain
  level?: Level
  limit?: number
} = {}): Promise<Flashcard[]> {
  const { domain, level, limit = 200 } = filters
  const conditions: string[] = []
  const params: unknown[] = []
  let i = 1

  if (domain) { conditions.push(`domain = $${i++}`); params.push(domain) }
  if (level) { conditions.push(`level = $${i++}`); params.push(level) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const rows = await sql.query(
    `SELECT * FROM flashcards ${where} ORDER BY created_at ASC LIMIT $${i}`,
    [...params, limit]
  )
  return rows as Flashcard[]
}

export async function saveFlashcard(
  card: Omit<Flashcard, 'id' | 'created_at'>
): Promise<Flashcard> {
  const rows = await sql.query(
    `INSERT INTO flashcards (front, back, domain, level, source)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [card.front, card.back, card.domain, card.level, card.source]
  )
  return rows[0] as Flashcard
}

export async function saveFlashcardReview(
  flashcard_id: number,
  known: boolean
): Promise<void> {
  await sql.query(
    'INSERT INTO flashcard_reviews (flashcard_id, known) VALUES ($1, $2)',
    [flashcard_id, known]
  )
}

export async function getFlashcardReviewStats(
  ids: number[]
): Promise<FlashcardReviewStat[]> {
  if (ids.length === 0) return []
  const rows = await sql.query(
    `SELECT
       flashcard_id,
       COUNT(*)::int AS total,
       SUM(CASE WHEN known THEN 1 ELSE 0 END)::int AS known_count,
       (array_agg(known ORDER BY timestamp DESC))[1] AS last_known
     FROM flashcard_reviews
     WHERE flashcard_id = ANY($1::int[])
     GROUP BY flashcard_id`,
    [ids]
  )
  return rows as FlashcardReviewStat[]
}

// ─── Simulacros ───────────────────────────────────────────────────────────────

export async function createSimulacro(
  type: string,
  title: string,
  subject: string
): Promise<ExamSession> {
  const rows = await sql.query(
    `INSERT INTO exam_sessions (type, title, subject, content)
     VALUES ($1, $2, $3, '') RETURNING *`,
    [type, title, subject]
  )
  return rows[0] as ExamSession
}

export async function saveSimulacroResponse(
  id: number,
  content: string
): Promise<void> {
  await sql.query(
    'UPDATE exam_sessions SET content = $1 WHERE id = $2',
    [content, id]
  )
}

export async function saveSimulacroFeedback(
  id: number,
  ai_feedback: string,
  score: number
): Promise<void> {
  await sql.query(
    'UPDATE exam_sessions SET ai_feedback = $1, score = $2 WHERE id = $3',
    [ai_feedback, score, id]
  )
}

export async function getSimulacros(): Promise<ExamSession[]> {
  const rows = await sql.query(
    `SELECT id, type, title, subject, content, ai_feedback, score, timestamp
     FROM exam_sessions
     WHERE subject IS NOT NULL
     ORDER BY timestamp DESC
     LIMIT 50`
  )
  return rows as ExamSession[]
}

export async function getSimulacroById(id: number): Promise<ExamSession | null> {
  const rows = await sql.query(
    'SELECT * FROM exam_sessions WHERE id = $1',
    [id]
  )
  return (rows[0] as ExamSession) ?? null
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

export type GlobalStats = {
  total_attempts: number
  correct_count: number
  unique_exercises: number
  total_study_min: number
}

export type DomainStat = {
  domain: string
  attempts: number
  correct_count: number
}

export type DailyActivity = {
  date: string
  duration_min: number
  exercises_done: number
}

export type SimulacroGlobalStats = {
  total: number
  corrected: number
  avg_score: number | null
}

export type FlashcardGlobalStats = {
  total_reviews: number
  known_count: number
}

export async function getGlobalStats(): Promise<GlobalStats> {
  const [attemptsRow, studyRow] = await Promise.all([
    sql.query(
      `SELECT COUNT(*)::int AS total_attempts,
              SUM(CASE WHEN correct THEN 1 ELSE 0 END)::int AS correct_count,
              COUNT(DISTINCT exercise_id)::int AS unique_exercises
       FROM exercise_attempts`
    ),
    sql.query(
      `SELECT COALESCE(SUM(duration_min), 0)::int AS total_min FROM study_sessions`
    ),
  ])
  const a = attemptsRow[0] as { total_attempts: number; correct_count: number; unique_exercises: number }
  return {
    total_attempts: a?.total_attempts ?? 0,
    correct_count: a?.correct_count ?? 0,
    unique_exercises: a?.unique_exercises ?? 0,
    total_study_min: (studyRow[0] as { total_min: number })?.total_min ?? 0,
  }
}

export async function getDomainStats(): Promise<DomainStat[]> {
  const rows = await sql.query(
    `SELECT e.domain,
            COUNT(ea.id)::int AS attempts,
            SUM(CASE WHEN ea.correct THEN 1 ELSE 0 END)::int AS correct_count
     FROM exercise_attempts ea
     JOIN exercises e ON e.id = ea.exercise_id
     GROUP BY e.domain
     ORDER BY e.domain`
  )
  return rows as DomainStat[]
}

export async function getDailyActivity(days: number = 7): Promise<DailyActivity[]> {
  const rows = await sql.query(
    `SELECT date::text,
            SUM(duration_min)::int AS duration_min,
            SUM(exercises_done)::int AS exercises_done
     FROM study_sessions
     WHERE date >= CURRENT_DATE - INTERVAL '${days - 1} days'
     GROUP BY date
     ORDER BY date`
  )
  return rows as DailyActivity[]
}

export async function getSimulacroGlobalStats(): Promise<SimulacroGlobalStats> {
  const rows = await sql.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(CASE WHEN ai_feedback IS NOT NULL THEN 1 END)::int AS corrected,
            ROUND(AVG(score)::numeric, 1) AS avg_score
     FROM exam_sessions
     WHERE subject IS NOT NULL`
  )
  const r = rows[0] as SimulacroGlobalStats
  return {
    total: r?.total ?? 0,
    corrected: r?.corrected ?? 0,
    avg_score: r?.avg_score ?? null,
  }
}

export async function getFlashcardGlobalStats(): Promise<FlashcardGlobalStats> {
  const rows = await sql.query(
    `SELECT COUNT(*)::int AS total_reviews,
            SUM(CASE WHEN known THEN 1 ELSE 0 END)::int AS known_count
     FROM flashcard_reviews`
  )
  const r = rows[0] as FlashcardGlobalStats
  return {
    total_reviews: r?.total_reviews ?? 0,
    known_count: r?.known_count ?? 0,
  }
}
