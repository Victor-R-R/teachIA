CREATE TABLE IF NOT EXISTS flashcards (
  id SERIAL PRIMARY KEY,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  domain TEXT NOT NULL CHECK (domain IN ('langue', 'civi_espagne', 'civi_latam', 'didactique')),
  level TEXT NOT NULL CHECK (level IN ('A', 'B', 'C')),
  source TEXT NOT NULL DEFAULT 'curated',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flashcard_reviews (
  id SERIAL PRIMARY KEY,
  flashcard_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
  known BOOLEAN NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flashcards_domain ON flashcards(domain);
CREATE INDEX IF NOT EXISTS idx_flashcards_level ON flashcards(level);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_flashcard ON flashcard_reviews(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_timestamp ON flashcard_reviews(timestamp DESC);
