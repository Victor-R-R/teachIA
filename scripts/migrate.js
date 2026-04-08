const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

const sql = neon(process.env.DATABASE_URL);
const migrationSql = fs.readFileSync('./scripts/migrate.sql', 'utf8');

// Split by semicolon and filter out empty statements
const statements = migrationSql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0);

async function runMigrations() {
  try {
    for (const statement of statements) {
      await sql.query(statement);
    }
    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runMigrations();
