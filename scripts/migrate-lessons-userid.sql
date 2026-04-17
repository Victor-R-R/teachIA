ALTER TABLE lessons ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_lessons_user_id ON lessons(user_id)
