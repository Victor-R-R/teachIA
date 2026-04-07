import { neon } from '@neondatabase/serverless'

// Lazy initialization so the module can be imported in test environments
// without a real DATABASE_URL. The neon() call is deferred until first use.
let _sql: ReturnType<typeof neon> | null = null

function getSql(): ReturnType<typeof neon> {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL!)
  }
  return _sql
}

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

export async function getExercises(filters: {
  domain?: string
  level?: string
  type?: string
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
  const rows = await getSql()(
    `SELECT * FROM exercises ${where} ORDER BY RANDOM() LIMIT $${i}`,
    [...params, limit]
  )
  return rows as Exercise[]
}

export async function getExerciseById(id: number): Promise<Exercise | null> {
  const rows = await getSql()('SELECT * FROM exercises WHERE id = $1', [id])
  return (rows[0] as Exercise) ?? null
}

export async function saveAttempt(attempt: Omit<ExerciseAttempt, 'id' | 'timestamp'>): Promise<void> {
  await getSql()(
    'INSERT INTO exercise_attempts (exercise_id, correct, time_spent) VALUES ($1, $2, $3)',
    [attempt.exercise_id, attempt.correct, attempt.time_spent]
  )
}

export async function saveExercise(exercise: Omit<Exercise, 'id' | 'created_at'>): Promise<Exercise> {
  const rows = await getSql()(
    `INSERT INTO exercises (theme, domain, type, question, options, answer, explanation, level, source)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [exercise.theme, exercise.domain, exercise.type, exercise.question,
     JSON.stringify(exercise.options), exercise.answer, exercise.explanation,
     exercise.level, exercise.source]
  )
  return rows[0] as Exercise
}
