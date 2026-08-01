-- Migration: Add redirect_url column to matches table
-- This supports per-match redirect URLs so each match card can link to a
-- different destination (e.g. different problem links per round/match).
-- The column is nullable with a default placeholder value.
-- Safe to run on existing data: uses ADD COLUMN IF NOT EXISTS.
-- All existing match rows automatically receive the default value.

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS redirect_url TEXT DEFAULT 'https://vnrvjiet.acm.org';

-- Back-fill any existing rows that have NULL (in case the column already existed
-- without a default and rows were inserted before this migration).
UPDATE matches
  SET redirect_url = 'https://vnrvjiet.acm.org'
  WHERE redirect_url IS NULL;

-- Index not required for redirect_url (looked up by match id, which is already PK).

-- Verification
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name  = 'matches'
  AND column_name = 'redirect_url';

-- Spot-check: first 5 matches should show the default URL
SELECT id, round_number, match_number, redirect_url
FROM   matches
ORDER  BY round_number, match_number
LIMIT  5;
