CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  domain TEXT NOT NULL CHECK (domain IN ('langue', 'civi_espagne', 'civi_latam', 'didactique')),
  level TEXT NOT NULL CHECK (level IN ('A', 'B', 'C')),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE exercises ADD COLUMN IF NOT EXISTS lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_exercises_lesson_id ON exercises(lesson_id)
