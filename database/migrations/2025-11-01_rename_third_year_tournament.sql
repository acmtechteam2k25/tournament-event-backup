-- Migration: Rename "3rd/4th Year" tournament display name to "3rd Year"
-- This is belt-and-suspenders: migration 2 already sets the name correctly
-- via the upsert, but this ensures any row that was created with the old name
-- (e.g. via insert_all_tournaments.sql) is also corrected.
-- Run ORDER: 4 of 4

UPDATE tournament
SET name = '3rd Year Tournament 2k25'
WHERE id   = 'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID
  AND name LIKE '%3rd/4th%';

-- Also catch any description that still says "Third/Fourth"
UPDATE tournament
SET description = 'ACM Tournament 2025 - Third Year Edition'
WHERE id        = 'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID
  AND description LIKE '%Third/Fourth%';

-- Verification
SELECT id, name, description, max_participants, num_rounds
FROM tournament
WHERE id = 'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID;
