CREATE TABLE IF NOT EXISTS user_profile (
  id SERIAL PRIMARY KEY,
  exam_date DATE NOT NULL,
  level_langue TEXT CHECK (level_langue IN ('A','B','C')),
  level_civi TEXT CHECK (level_civi IN ('A','B','C')),
  level_didactique TEXT CHECK (level_didactique IN ('A','B','C')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  theme TEXT NOT NULL,
  domain TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('qcm','vrai_faux','lacunaire','chronologie','association')),
  question TEXT NOT NULL,
  options JSONB,
  answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('A','B','C')),
  source TEXT NOT NULL DEFAULT 'curated',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercise_attempts (
  id SERIAL PRIMARY KEY,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
  correct BOOLEAN NOT NULL,
  time_spent INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercises_domain ON exercises(domain);
CREATE INDEX IF NOT EXISTS idx_exercises_level ON exercises(level);
CREATE INDEX IF NOT EXISTS idx_attempts_timestamp ON exercise_attempts(timestamp);
