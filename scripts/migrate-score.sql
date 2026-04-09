ALTER TABLE exercise_attempts ADD COLUMN IF NOT EXISTS score_correct INT;
ALTER TABLE exercise_attempts ADD COLUMN IF NOT EXISTS score_total INT
