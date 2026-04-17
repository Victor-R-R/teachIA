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
  lesson_id: number | null
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
  best_score_correct: number | null
  best_score_total: number | null
}

export type ExerciseStatus = 'not_started' | 'in_progress' | 'completed'

export function getExerciseStatus(stats: AttemptStats | undefined): ExerciseStatus {
  if (!stats || stats.attempt_count === 0) return 'not_started'
  if (stats.has_correct) return 'completed'
  return 'in_progress'
}

export async function getAttemptStatsByExercises(userId: string, ids: number[]): Promise<AttemptStats[]> {
  if (ids.length === 0) return []
  const rows = await sql.query(
    `SELECT exercise_id,
            COUNT(*)::int AS attempt_count,
            bool_or(correct) AS has_correct,
            MAX(score_correct)::int AS best_score_correct,
            MAX(score_total)::int AS best_score_total
     FROM exercise_attempts
     WHERE user_id = $1 AND exercise_id = ANY($2::int[])
     GROUP BY exercise_id`,
    [userId, ids]
  )
  return rows as AttemptStats[]
}

export async function getExercises(userId: string, filters: {
  domain?: Domain
  level?: Level
  type?: ExerciseType
  limit?: number
} = {}): Promise<Exercise[]> {
  const { domain, level, type, limit = 20 } = filters
  const conditions: string[] = ['(user_id IS NULL OR user_id = $1)']
  const params: unknown[] = [userId]
  let i = 2

  if (domain) { conditions.push(`domain = $${i++}`); params.push(domain) }
  if (level) { conditions.push(`level = $${i++}`); params.push(level) }
  if (type) { conditions.push(`type = $${i++}`); params.push(type) }

  const where = `WHERE ${conditions.join(' AND ')}`
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

export async function saveAttempt(userId: string, attempt: {
  exercise_id: number
  correct: boolean
  time_spent: number | null
  exercise_level: 'A' | 'B' | 'C'
  exercise_domain: string
  score_correct?: number
  score_total?: number
}): Promise<void> {
  const { exercise_id, correct, time_spent, exercise_level, exercise_domain, score_correct, score_total } = attempt

  // 1. Enregistrer la tentative
  await sql.query(
    'INSERT INTO exercise_attempts (user_id, exercise_id, correct, time_spent, score_correct, score_total) VALUES ($1, $2, $3, $4, $5, $6)',
    [userId, exercise_id, correct, time_spent, score_correct ?? null, score_total ?? null]
  )

  // 2. Mettre à jour study_sessions (au moins 1 min dès qu'un exercice est fait)
  if (time_spent !== null && time_spent > 0) {
    const durationMin = Math.max(1, Math.round(time_spent / 60))
    await sql.query(
      `INSERT INTO study_sessions (date, domain, user_id, duration_min, exercises_done, correct_count)
       VALUES (CURRENT_DATE, $1, $2, $3, 1, $4)
       ON CONFLICT (date, domain, user_id) DO UPDATE SET
         duration_min = study_sessions.duration_min + EXCLUDED.duration_min,
         exercises_done = study_sessions.exercises_done + 1,
         correct_count = study_sessions.correct_count + EXCLUDED.correct_count`,
      [exercise_domain, userId, durationMin, correct ? 1 : 0]
    )
  }

  // 3. Arrêt si réponse incorrecte
  if (!correct) return

  // 4. Incrémenter XP
  const xpGain: Record<'A' | 'B' | 'C', number> = { A: 30, B: 20, C: 10 }
  const gain = xpGain[exercise_level]
  const rows = await sql.query(
    'UPDATE user_profile SET xp = xp + $1 WHERE user_id = $2 RETURNING xp, level_xp',
    [gain, userId]
  )
  if (rows.length === 0) return

  const { xp: newXp, level_xp: currentLevel } = rows[0] as { xp: number; level_xp: number }
  const nextThreshold = (currentLevel + 1) * (currentLevel + 1) * 100
  if (newXp >= nextThreshold) {
    await sql.query('UPDATE user_profile SET level_xp = level_xp + 1 WHERE user_id = $1', [userId])
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
       WHERE e.domain = ANY($1) AND ea.user_id = $2
       ORDER BY ea.timestamp DESC
       LIMIT 20
     ) ea`,
    [domainGroup, userId]
  )

  const { total, correct_count } = statRows[0] as { total: number; correct_count: number }
  if (total >= 5) {
    const pct = correct_count / total
    const newLevel = pct >= 0.8 ? 'C' : pct >= 0.5 ? 'B' : 'A'
    await sql.query(`UPDATE user_profile SET ${levelColumn} = $1 WHERE user_id = $2`, [newLevel, userId])
  }
}

export async function saveExercise(userId: string | null, exercise: Omit<Exercise, 'id' | 'created_at'>): Promise<Exercise> {
  const rows = await sql.query(
    `INSERT INTO exercises (user_id, theme, domain, type, question, options, answer, explanation, level, source)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [userId, exercise.theme, exercise.domain, exercise.type, exercise.question,
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
  capes_exercise_id: string | null
  first_user_message: string | null
}

export type ConversationMessage = {
  id: number
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export async function createConversation(userId: string, id: string, capesExerciseId?: string): Promise<void> {
  await sql.query(
    `INSERT INTO conversations (id, user_id, capes_exercise_id) VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE SET
       capes_exercise_id = COALESCE(conversations.capes_exercise_id, EXCLUDED.capes_exercise_id)`,
    [id, userId, capesExerciseId ?? null]
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

export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  const rows = await sql.query(
    `SELECT c.id, c.title, c.created_at, c.updated_at, c.capes_exercise_id,
            COUNT(m.id)::text AS message_count,
            (SELECT content FROM conversation_messages
             WHERE conversation_id = c.id AND role = 'user'
             ORDER BY id ASC LIMIT 1) AS first_user_message
     FROM conversations c
     LEFT JOIN conversation_messages m ON m.conversation_id = c.id
     WHERE c.user_id = $1
     GROUP BY c.id
     ORDER BY c.updated_at DESC`,
    [userId]
  )
  // Neon retourne des Date objects — on les sérialise en ISO string UTC
  // pour éviter les problèmes de sérialisation React Server→Client
  return (rows as ConversationSummary[]).map(r => ({
    ...r,
    updated_at: (r.updated_at as unknown) instanceof Date ? (r.updated_at as unknown as Date).toISOString() : r.updated_at,
    created_at: (r.created_at as unknown) instanceof Date ? (r.created_at as unknown as Date).toISOString() : r.created_at,
  }))
}

export async function getCAPESConversationMap(userId: string): Promise<Map<string, string>> {
  const rows = await sql.query(
    `SELECT id, capes_exercise_id FROM conversations
     WHERE user_id = $1 AND capes_exercise_id IS NOT NULL`,
    [userId]
  ) as { id: string; capes_exercise_id: string }[]
  return new Map(rows.map(r => [r.capes_exercise_id, r.id]))
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
  last_checked_date: string | null
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

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const rows = await sql.query('SELECT * FROM user_profile WHERE user_id = $1', [userId])
  return (rows[0] as UserProfile) ?? null
}

export async function logStudyActivity(userId: string, domain: string, durationMin: number): Promise<void> {
  await sql.query(
    `INSERT INTO study_sessions (date, domain, user_id, duration_min, exercises_done, correct_count)
     VALUES (CURRENT_DATE, $1, $2, $3, 0, 0)
     ON CONFLICT (date, domain, user_id) DO UPDATE SET
       duration_min = study_sessions.duration_min + EXCLUDED.duration_min`,
    [domain, userId, durationMin]
  )
}

export async function getTodayMinutes(userId: string): Promise<number> {
  const rows = await sql.query(
    `SELECT COALESCE(SUM(duration_min), 0)::int AS total_min
     FROM study_sessions WHERE user_id = $1 AND date = CURRENT_DATE`,
    [userId]
  )
  return (rows[0] as { total_min: number | null }).total_min ?? 0
}

export async function getInProgressExercises(userId: string): Promise<InProgressExercise[]> {
  const rows = await sql.query(
    `WITH stats AS (
       SELECT exercise_id,
              COUNT(*)::int AS attempt_count,
              bool_or(correct) AS has_correct,
              MAX(timestamp) AS last_attempt
       FROM exercise_attempts
       WHERE user_id = $1
       GROUP BY exercise_id
     )
     SELECT e.id, e.question, e.type, e.domain, e.level, s.attempt_count
     FROM stats s
     JOIN exercises e ON e.id = s.exercise_id
     WHERE NOT s.has_correct
     ORDER BY s.last_attempt DESC
     LIMIT 5`,
    [userId]
  )
  return rows as InProgressExercise[]
}

export async function getInProgressSimulations(userId: string): Promise<ExamSession[]> {
  const rows = await sql.query(
    `SELECT * FROM exam_sessions WHERE user_id = $1 AND ai_feedback IS NULL ORDER BY timestamp DESC LIMIT 3`,
    [userId]
  )
  return rows as ExamSession[]
}

export async function updateDailyGoal(userId: string, minutes: number): Promise<void> {
  await sql.query('UPDATE user_profile SET daily_goal_min = $1 WHERE user_id = $2', [minutes, userId])
}

const XP_DECAY_PER_DAY = 10

/**
 * Déduit du XP pour chaque jour sans activité depuis la dernière vérification.
 * À appeler au chargement du dashboard. Retourne le XP perdu (0 si aucun).
 */
export async function applyXpDecay(userId: string): Promise<number> {
  const profileRows = await sql.query(
    'SELECT last_checked_date FROM user_profile WHERE user_id = $1',
    [userId]
  )
  if (profileRows.length === 0) return 0

  const { last_checked_date } = profileRows[0] as { last_checked_date: string | null }

  // Si déjà vérifié aujourd'hui, rien à faire
  if (last_checked_date) {
    const lastChecked = new Date(last_checked_date)
    const today = new Date()
    lastChecked.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    if (lastChecked >= today) return 0
  }

  // Compter les jours sans study_session entre (last_checked + 1) et hier
  const inactiveRows = await sql.query(
    `SELECT COUNT(*)::int AS inactive_days
     FROM generate_series(
       COALESCE($1::date, CURRENT_DATE) + 1,
       CURRENT_DATE - 1,
       '1 day'::interval
     ) AS d(day)
     WHERE NOT EXISTS (
       SELECT 1 FROM study_sessions ss WHERE ss.date = d.day::date AND ss.user_id = $2
     )`,
    [last_checked_date ?? null, userId]
  )

  const inactiveDays = (inactiveRows[0] as { inactive_days: number }).inactive_days

  // Toujours mettre à jour la date de vérification
  await sql.query('UPDATE user_profile SET last_checked_date = CURRENT_DATE WHERE user_id = $1', [userId])

  if (inactiveDays === 0) return 0

  const xpLost = inactiveDays * XP_DECAY_PER_DAY
  await sql.query('UPDATE user_profile SET xp = GREATEST(0, xp - $1) WHERE user_id = $2', [xpLost, userId])

  return xpLost
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

export async function getFlashcards(userId: string, filters: {
  domain?: Domain
  level?: Level
  limit?: number
} = {}): Promise<Flashcard[]> {
  const { domain, level, limit = 200 } = filters
  const conditions: string[] = ['(user_id IS NULL OR user_id = $1)']
  const params: unknown[] = [userId]
  let i = 2

  if (domain) { conditions.push(`domain = $${i++}`); params.push(domain) }
  if (level) { conditions.push(`level = $${i++}`); params.push(level) }

  const where = `WHERE ${conditions.join(' AND ')}`
  const rows = await sql.query(
    `SELECT * FROM flashcards ${where} ORDER BY created_at ASC LIMIT $${i}`,
    [...params, limit]
  )
  return rows as Flashcard[]
}

export async function saveFlashcard(
  userId: string | null,
  card: Omit<Flashcard, 'id' | 'created_at'>
): Promise<Flashcard> {
  const rows = await sql.query(
    `INSERT INTO flashcards (user_id, front, back, domain, level, source)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [userId, card.front, card.back, card.domain, card.level, card.source]
  )
  return rows[0] as Flashcard
}

export async function saveFlashcardReview(
  userId: string,
  flashcard_id: number,
  known: boolean
): Promise<void> {
  await sql.query(
    'INSERT INTO flashcard_reviews (user_id, flashcard_id, known) VALUES ($1, $2, $3)',
    [userId, flashcard_id, known]
  )
}

export async function getFlashcardReviewStats(
  userId: string,
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
     WHERE user_id = $1 AND flashcard_id = ANY($2::int[])
     GROUP BY flashcard_id`,
    [userId, ids]
  )
  return rows as FlashcardReviewStat[]
}

// ─── Simulacros ───────────────────────────────────────────────────────────────

export async function createSimulacro(
  userId: string,
  type: string,
  title: string,
  subject: string
): Promise<ExamSession> {
  const rows = await sql.query(
    `INSERT INTO exam_sessions (user_id, type, title, subject, content)
     VALUES ($1, $2, $3, $4, '') RETURNING *`,
    [userId, type, title, subject]
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

export async function getSimulacros(userId: string): Promise<ExamSession[]> {
  const rows = await sql.query(
    `SELECT id, type, title, subject, content, ai_feedback, score, timestamp
     FROM exam_sessions
     WHERE user_id = $1 AND subject IS NOT NULL
     ORDER BY timestamp DESC
     LIMIT 50`,
    [userId]
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

export async function getGlobalStats(userId: string): Promise<GlobalStats> {
  const [attemptsRow, studyRow] = await Promise.all([
    sql.query(
      `SELECT COUNT(*)::int AS total_attempts,
              SUM(CASE WHEN correct THEN 1 ELSE 0 END)::int AS correct_count,
              COUNT(DISTINCT exercise_id)::int AS unique_exercises
       FROM exercise_attempts
       WHERE user_id = $1`,
      [userId]
    ),
    sql.query(
      `SELECT COALESCE(SUM(duration_min), 0)::int AS total_min FROM study_sessions WHERE user_id = $1`,
      [userId]
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

export async function getDomainStats(userId: string): Promise<DomainStat[]> {
  const rows = await sql.query(
    `SELECT e.domain,
            COUNT(ea.id)::int AS attempts,
            SUM(CASE WHEN ea.correct THEN 1 ELSE 0 END)::int AS correct_count
     FROM exercise_attempts ea
     JOIN exercises e ON e.id = ea.exercise_id
     WHERE ea.user_id = $1
     GROUP BY e.domain
     ORDER BY e.domain`,
    [userId]
  )
  return rows as DomainStat[]
}

export async function getDailyActivity(userId: string, days: number = 7): Promise<DailyActivity[]> {
  const rows = await sql.query(
    `SELECT date::text,
            SUM(duration_min)::int AS duration_min,
            SUM(exercises_done)::int AS exercises_done
     FROM study_sessions
     WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '${days - 1} days'
     GROUP BY date
     ORDER BY date`,
    [userId]
  )
  return rows as DailyActivity[]
}

export async function getSimulacroGlobalStats(userId: string): Promise<SimulacroGlobalStats> {
  const rows = await sql.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(CASE WHEN ai_feedback IS NOT NULL THEN 1 END)::int AS corrected,
            ROUND(AVG(score)::numeric, 1) AS avg_score
     FROM exam_sessions
     WHERE user_id = $1 AND subject IS NOT NULL`,
    [userId]
  )
  const r = rows[0] as SimulacroGlobalStats
  return {
    total: r?.total ?? 0,
    corrected: r?.corrected ?? 0,
    avg_score: r?.avg_score ?? null,
  }
}

export async function createUserProfile(userId: string, data: {
  level_langue: 'A' | 'B' | 'C'
  level_civi: 'A' | 'B' | 'C'
  level_didactique: 'A' | 'B' | 'C'
}): Promise<UserProfile> {
  const rows = await sql.query(
    `INSERT INTO user_profile (user_id, level_langue, level_civi, level_didactique)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, data.level_langue, data.level_civi, data.level_didactique]
  )
  return rows[0] as UserProfile
}

export type StudyPlanItem = {
  id: number
  week_number: number
  domain: string
  objective: string
  completed: boolean
  target_date: string
}

export async function saveStudyPlan(userId: string, items: {
  week_number: number
  domain: string
  objective: string
  target_date: string
}[]): Promise<void> {
  for (const item of items) {
    await sql.query(
      `INSERT INTO study_plan (user_id, week_number, domain, objective, target_date) VALUES ($1, $2, $3, $4, $5)`,
      [userId, item.week_number, item.domain, item.objective, item.target_date]
    )
  }
}

export async function getFlashcardGlobalStats(userId: string): Promise<FlashcardGlobalStats> {
  const rows = await sql.query(
    `SELECT COUNT(*)::int AS total_reviews,
            SUM(CASE WHEN known THEN 1 ELSE 0 END)::int AS known_count
     FROM flashcard_reviews
     WHERE user_id = $1`,
    [userId]
  )
  const r = rows[0] as FlashcardGlobalStats
  return {
    total_reviews: r?.total_reviews ?? 0,
    known_count: r?.known_count ?? 0,
  }
}

// ─── Catalogue partagé (admin) ───────────────────────────────────────────────

export async function getCatalogExercises(filters: {
  domain?: Domain
  level?: Level
  type?: ExerciseType
} = {}): Promise<Exercise[]> {
  const { domain, level, type } = filters
  const conditions: string[] = ['user_id IS NULL']
  const params: unknown[] = []
  let i = 1

  if (domain) { conditions.push(`domain = $${i++}`); params.push(domain) }
  if (level) { conditions.push(`level = $${i++}`); params.push(level) }
  if (type) { conditions.push(`type = $${i++}`); params.push(type) }

  const where = `WHERE ${conditions.join(' AND ')}`
  const rows = await sql.query(
    `SELECT * FROM exercises ${where} ORDER BY domain, level, created_at DESC`,
    params
  )
  return rows as Exercise[]
}

export async function getCatalogFlashcards(filters: {
  domain?: Domain
  level?: Level
} = {}): Promise<Flashcard[]> {
  const { domain, level } = filters
  const conditions: string[] = ['user_id IS NULL']
  const params: unknown[] = []
  let i = 1

  if (domain) { conditions.push(`domain = $${i++}`); params.push(domain) }
  if (level) { conditions.push(`level = $${i++}`); params.push(level) }

  const where = `WHERE ${conditions.join(' AND ')}`
  const rows = await sql.query(
    `SELECT * FROM flashcards ${where} ORDER BY domain, level, created_at ASC`,
    params
  )
  return rows as Flashcard[]
}

// ─── Compte utilisateur ──────────────────────────────────────────────────────

export async function deleteUser(userId: string): Promise<void> {
  // Supprimer les données applicatives (ordre : dépendances d'abord)
  await sql.query(
    'DELETE FROM conversation_messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id = $1)',
    [userId]
  )
  await sql.query('DELETE FROM conversations WHERE user_id = $1', [userId])
  await sql.query('DELETE FROM exam_sessions WHERE user_id = $1', [userId])
  await sql.query('DELETE FROM flashcard_reviews WHERE user_id = $1', [userId])
  await sql.query('DELETE FROM study_sessions WHERE user_id = $1', [userId])
  await sql.query('DELETE FROM exercise_attempts WHERE user_id = $1', [userId])
  await sql.query('DELETE FROM user_profile WHERE user_id = $1', [userId])
  await sql.query('DELETE FROM study_plan WHERE user_id = $1', [userId])
  // Tables Auth.js (camelCase entre guillemets)
  await sql.query('DELETE FROM accounts WHERE "userId" = $1', [userId])
  await sql.query('DELETE FROM sessions WHERE "userId" = $1', [userId])
  // Enregistrement utilisateur en dernier
  await sql.query('DELETE FROM users WHERE id = $1', [userId])
}

// ─── Leçons ───────────────────────────────────────────────────────────────────

export type Lesson = {
  id: number
  title: string
  content: string
  domain: string
  level: 'A' | 'B' | 'C'
  user_id: string | null
  created_at: string
  exercise_count?: number
}

export type LessonWithExercises = Lesson & {
  exercises: Exercise[]
}

export async function getLessons(): Promise<Lesson[]> {
  const rows = await sql.query(`
    SELECT l.*, COUNT(e.id)::int AS exercise_count
    FROM lessons l
    LEFT JOIN exercises e ON e.lesson_id = l.id
    WHERE l.user_id IS NULL
    GROUP BY l.id
    ORDER BY l.domain, l.level, l.title
  `)
  return rows as Lesson[]
}

export async function getUserLessons(userId: string): Promise<Lesson[]> {
  const rows = await sql.query(`
    SELECT l.*, COUNT(e.id)::int AS exercise_count
    FROM lessons l
    LEFT JOIN exercises e ON e.lesson_id = l.id
    WHERE l.user_id = $1
    GROUP BY l.id
    ORDER BY l.created_at DESC
  `, [userId])
  return rows as Lesson[]
}

export async function getLessonById(id: number): Promise<LessonWithExercises | null> {
  const lessons = await sql.query('SELECT * FROM lessons WHERE id = $1', [id])
  if (!lessons[0]) return null
  const exercises = await sql.query(
    'SELECT * FROM exercises WHERE lesson_id = $1 ORDER BY level, created_at',
    [id]
  )
  return { ...(lessons[0] as Lesson), exercises: exercises as Exercise[] }
}

export async function getLessonByExerciseId(exerciseId: number): Promise<Lesson | null> {
  const rows = await sql.query(
    `SELECT l.* FROM lessons l
     JOIN exercises e ON e.lesson_id = l.id
     WHERE e.id = $1`,
    [exerciseId]
  )
  return (rows[0] as Lesson) ?? null
}

export async function createLesson(data: {
  title: string
  content: string
  domain: string
  level: 'A' | 'B' | 'C'
  userId?: string | null
}): Promise<Lesson> {
  const rows = await sql.query(
    'INSERT INTO lessons (title, content, domain, level, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [data.title, data.content, data.domain, data.level, data.userId ?? null]
  )
  return rows[0] as Lesson
}

export async function getLessonOwner(id: number): Promise<string | null> {
  const rows = await sql.query('SELECT user_id FROM lessons WHERE id = $1', [id])
  return (rows[0] as { user_id: string | null } | undefined)?.user_id ?? null
}

export async function updateLesson(id: number, data: { title?: string; content?: string }): Promise<void> {
  const fields: string[] = []
  const params: unknown[] = []
  let i = 1
  if (data.title !== undefined) { fields.push(`title = $${i++}`); params.push(data.title) }
  if (data.content !== undefined) { fields.push(`content = $${i++}`); params.push(data.content) }
  if (fields.length === 0) return
  params.push(id)
  await sql.query(`UPDATE lessons SET ${fields.join(', ')} WHERE id = $${i}`, params)
}

export async function deleteLesson(id: number): Promise<void> {
  await sql.query('DELETE FROM lessons WHERE id = $1', [id])
}

export async function setLessonExercises(lessonId: number, exerciseIds: number[]): Promise<void> {
  await sql.query('UPDATE exercises SET lesson_id = NULL WHERE lesson_id = $1', [lessonId])
  if (exerciseIds.length > 0) {
    await sql.query(
      'UPDATE exercises SET lesson_id = $1 WHERE id = ANY($2::int[])',
      [lessonId, exerciseIds]
    )
  }
}
