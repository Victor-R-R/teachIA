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

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id SERIAL PRIMARY KEY,
  conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conv_messages_conv_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);

-- Dashboard gamification
ALTER TABLE user_profile
  ADD COLUMN IF NOT EXISTS xp             INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level_xp       INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS daily_goal_min INTEGER DEFAULT 60;

CREATE TABLE IF NOT EXISTS study_sessions (
  id              SERIAL PRIMARY KEY,
  date            DATE NOT NULL,
  domain          TEXT NOT NULL,
  duration_min    INTEGER DEFAULT 0,
  exercises_done  INTEGER DEFAULT 0,
  correct_count   INTEGER DEFAULT 0,
  UNIQUE (date, domain)
);

CREATE TABLE IF NOT EXISTS exam_sessions (
  id          SERIAL PRIMARY KEY,
  type        TEXT NOT NULL,
  content     TEXT NOT NULL,
  ai_feedback TEXT,
  score       NUMERIC(4,1),
  timestamp   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(date);

-- Multi-question exercises
ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS questions JSONB;

-- Simulacros
ALTER TABLE exam_sessions
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT;

CREATE INDEX IF NOT EXISTS idx_exam_sessions_type ON exam_sessions(type);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_timestamp ON exam_sessions(timestamp DESC);
