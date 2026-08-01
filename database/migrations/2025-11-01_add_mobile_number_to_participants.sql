-- Migration: Add mobile_number column to participants
-- Safe to run on existing production data; column is nullable, no existing rows affected.
-- Run ORDER: 1 of 4 (run before tournament data changes)

-- Add the column if it does not already exist
ALTER TABLE participants
  ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(10);

-- Index for fast lookup during participant verification
-- Scoped to (tournament_id, mobile_number) to enforce per-tournament uniqueness checks
CREATE INDEX IF NOT EXISTS idx_participants_mobile_number
  ON participants(tournament_id, mobile_number);

-- Verification
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'participants'
  AND column_name = 'mobile_number';
