import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

const stmts = [
  'ALTER TABLE user_profile     ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE',
  'ALTER TABLE exercise_attempts ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE',
  'ALTER TABLE study_sessions    ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE',
  'ALTER TABLE exam_sessions     ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE',
  'ALTER TABLE conversations     ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE',
  'ALTER TABLE flashcard_reviews ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE',
  'ALTER TABLE exercises         ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE',
  'ALTER TABLE flashcards        ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE',
]

async function run() {
  for (const s of stmts) {
    await sql.query(s)
    console.log('OK:', s.slice(0, 70))
  }
  console.log('FK constraints restored.')
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })
