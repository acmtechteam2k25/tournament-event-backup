-- Migration: Remove the 1st Year tournament and all its dependent data
-- All child tables (participants, matches, rounds, scores, bracket_positions)
-- use ON DELETE CASCADE so a single DELETE on tournament cascades everything.
-- Run ORDER: 3 of 4

-- Safety guard: only delete the specific 1st Year tournament UUID.
-- If this row does not exist the DELETE is a no-op (safe to re-run).
DELETE FROM tournament
WHERE id = '11111111-1111-1111-1111-111111111111'::UUID;

-- Verification: confirm the row is gone
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ 1st Year tournament successfully removed'
    ELSE '❌ Row still exists – check cascade constraints'
  END AS status
FROM tournament
WHERE id = '11111111-1111-1111-1111-111111111111'::UUID;
