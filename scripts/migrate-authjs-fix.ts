import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

const statements = fs
  .readFileSync('./scripts/migrate-authjs-fix.sql', 'utf8')
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0)

async function run() {
  for (const stmt of statements) {
    await sql.query(stmt)
    console.log('OK:', stmt.slice(0, 80).replace(/\n/g, ' '))
  }
  console.log('Auth.js column fix complete.')
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
