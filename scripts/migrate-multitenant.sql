-- scripts/migrate-multitenant.sql

-- ─── Auth.js tables ──────────────────────────────────────────────────────────
-- Users table: Auth.js required columns + our custom role/blocked
-- Column names must match @auth/pg-adapter expectations exactly (camelCase)
CREATE TABLE IF NOT EXISTS users (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name            TEXT,
  email           TEXT        UNIQUE NOT NULL,
  "emailVerified" TIMESTAMPTZ,
  image           TEXT,
  role            TEXT        NOT NULL DEFAULT 'student'
                              CHECK (role IN ('student', 'superadmin')),
  blocked         BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  "userId"            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,
  provider            TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          INTEGER,
  token_type          TEXT,
  scope               TEXT,
  id_token            TEXT,
  session_state       TEXT,
  PRIMARY KEY (provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS sessions (
  "sessionToken" TEXT        PRIMARY KEY,
  "userId"       TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires        TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token      TEXT NOT NULL,
  expires    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ─── App settings ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT        PRIMARY KEY,
  value      TEXT        NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_settings (key, value) VALUES
  ('xp_gain_A',            '30'),
  ('xp_gain_B',            '20'),
  ('xp_gain_C',            '10'),
  ('xp_decay_per_day',     '10'),
  ('default_daily_goal_min','60')
ON CONFLICT (key) DO NOTHING;

-- ─── Add user_id to existing tables ──────────────────────────────────────────
ALTER TABLE user_profile      ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE exercise_attempts  ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE study_sessions     ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE exam_sessions      ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE conversations      ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE flashcard_reviews  ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id to content tables (NULL = shared catalogue)
ALTER TABLE exercises   ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE flashcards  ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;

-- Existing exercises and flashcards become shared catalogue (user_id stays NULL)

-- Fix study_sessions UNIQUE constraint to include user_id
ALTER TABLE study_sessions DROP CONSTRAINT IF EXISTS study_sessions_date_domain_key;
ALTER TABLE study_sessions
  ADD CONSTRAINT study_sessions_date_domain_user_key
  UNIQUE (date, domain, user_id);

-- ─── Purge orphaned user data (fresh start) ───────────────────────────────────
-- Exercises and flashcards are kept as shared catalogue
TRUNCATE TABLE flashcard_reviews, exam_sessions, study_sessions,
               exercise_attempts, conversation_messages, conversations,
               user_profile RESTART IDENTITY CASCADE;

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_profile_user_id       ON user_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_user_id  ON exercise_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id     ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_id      ON exam_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id      ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_user_id  ON flashcard_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_user_id          ON exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id         ON flashcards(user_id);
