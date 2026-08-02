-- ============================================================================
-- FIX_64_PARTICIPANT_BRACKETS.sql
-- ============================================================================
-- Purpose: Re-initialize the tournament database to support 64 participants
-- and 6 rounds, fixing the issue where only 8 Round 1 matches were displaying
--
-- Root Cause Analysis:
-- The database was initialized when maxParticipants was still set to 16
-- This created a 16-player bracket with only 8 Round 1 matches
-- Config was updated to 64 participants, but database was never re-initialized
--
-- This script:
-- 1. Clears old tournament data (cascades to all related records)
-- 2. Re-inserts tournaments with 64 participants and 6 rounds
-- 3. Re-initializes bracket structure using create_complete_tournament_bracket
-- 4. Data is ready for participant CSV import via the admin panel
--
-- ============================================================================

-- Step 1: Clear all existing tournament data for both tournaments
-- (CASCADE deletes all child records: matches, scores, etc.)
DELETE FROM tournament 
WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID
);

-- Step 2: Re-insert tournaments with 64 participants and 6 rounds
INSERT INTO tournament (
  id, 
  name, 
  description, 
  max_participants, 
  num_rounds,
  registration_start, 
  registration_end,
  tournament_start, 
  tournament_end
)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    '2nd Year Tournament 2k25',
    'ACM Tournament 2025 - Second Year',
    64,  -- 64 participants (was 16)
    6,   -- 6 rounds
    '2025-10-04 09:00:00+00',
    '2025-10-08 23:59:59+00',
    '2025-10-09 09:00:00+00',
    '2025-10-11 18:00:00+00'
  ),
  (
    'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID,
    '3rd Year Tournament 2k25',
    'ACM Tournament 2025 - Third Year',
    64,  -- 64 participants (was 16)
    6,   -- 6 rounds
    '2025-10-04 09:00:00+00',
    '2025-10-08 23:59:59+00',
    '2025-10-09 09:00:00+00',
    '2025-10-11 18:00:00+00'
  );

-- Step 3: Initialize bracket structure for both tournaments
-- This creates all 63 matches across 6 rounds:
--   Round 1: 32 matches
--   Round 2: 16 matches
--   Round 3: 8 matches
--   Round 4: 4 matches
--   Round 5: 2 matches
--   Round 6: 1 match
--
-- Each match is created with:
--   - Unique ID and match number
--   - Seeding order (1-32 in round 1)
--   - Player/TBD assignment
--   - Links to previous round matches (for winner advancement)
--   - Empty redirect_url (ready for individual match URLs)

SELECT create_complete_tournament_bracket('550e8400-e29b-41d4-a716-446655440000'::UUID, 64);
SELECT create_complete_tournament_bracket('d6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID, 64);

-- Step 4: Verify the bracket was created correctly
-- (You can run these queries after execution to confirm)
/*
-- Check tournament configuration
SELECT id, name, max_participants, num_rounds FROM tournament
WHERE id IN ('550e8400-e29b-41d4-a716-446655440000'::UUID, 'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID);

-- Count matches per round
SELECT 
  tournament_id,
  round_number,
  COUNT(*) as match_count
FROM match
WHERE tournament_id IN ('550e8400-e29b-41d4-a716-446655440000'::UUID, 'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID)
GROUP BY tournament_id, round_number
ORDER BY tournament_id, round_number;

-- Expected output:
--   Round 1: 32 matches
--   Round 2: 16 matches
--   Round 3: 8 matches
--   Round 4: 4 matches
--   Round 5: 2 matches
--   Round 6: 1 match
*/

-- ============================================================================
-- EXECUTION INSTRUCTIONS
-- ============================================================================
-- 1. Copy this entire script
-- 2. Open Supabase → SQL Editor for your project
-- 3. Create a NEW query
-- 4. Paste this script
-- 5. Click "Run"
-- 6. Wait for completion (should take 2-3 seconds)
-- 7. Re-import participant CSVs via the admin panel
-- 8. Refresh the bracket view in the frontend
--
-- The bracket should now display:
--   - Round 1: 32 matches
--   - Round 2: 16 matches
--   - Round 3: 8 matches
--   - Quarter Finals: 4 matches
--   - Semi Finals: 2 matches
--   - Final: 1 match
-- ============================================================================
