import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

const statements = fs
  .readFileSync('./scripts/migrate-lessons-userid.sql', 'utf8')
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0)

async function run() {
  for (const stmt of statements) {
    await sql.query(stmt)
    console.log('OK:', stmt.slice(0, 60).replace(/\n/g, ' '))
  }
  console.log('Lessons user_id migration complete.')
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
