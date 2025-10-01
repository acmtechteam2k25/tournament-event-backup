-- Add year column to participants
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS year INTEGER CHECK (year IN (2,3));

-- Optional: backfill year for existing rows if tournament mapping is known
-- UPDATE participants p
-- SET year = 2
-- WHERE p.tournament_id = '550e8400-e29b-41d4-a716-446655440000' AND year IS NULL;
-- UPDATE participants p
-- SET year = 3
-- WHERE p.tournament_id = 'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234' AND year IS NULL;

-- Index for filtering by year
CREATE INDEX IF NOT EXISTS idx_participants_year ON participants(year);

