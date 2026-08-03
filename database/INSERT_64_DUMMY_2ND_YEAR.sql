-- ============================================================================
-- INSERT_64_DUMMY_2ND_YEAR.sql
-- ============================================================================
-- Purpose: Initialize 2nd Year Tournament (550e8400-e29b-41d4-a716-446655440000)
--          with exactly 64 dummy participants and full 6-round bracket structure
--
-- This migration:
-- 1. Deletes ONLY 2nd Year tournament data (in correct cascade order)
-- 2. Inserts exactly 64 dummy participants
-- 3. Uses existing create_complete_tournament_bracket() function to build bracket
-- 4. Verifies 32 Round 1, 16 Round 2, 8 Round 3, 4 Quarter Finals, 2 Semi Finals, 1 Final
--
-- DO NOT TOUCH: 3rd Year tournament (d6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234)
-- DO NOT TOUCH: Tournament row itself (only delete child records)
--
-- ============================================================================

-- Tournament ID: 550e8400-e29b-41d4-a716-446655440000 (2nd Year)
-- Tournament Name: 2nd Year Tournament 2k25

BEGIN;

-- ============================================================================
-- STEP 1: DELETE EXISTING 2ND YEAR TOURNAMENT DATA (Correct Cascade Order)
-- ============================================================================

-- Delete scores first (depends on nothing else except match_id, round_id, player_id)
DELETE FROM scores 
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000'::UUID;

-- Delete bracket_positions (depends on match_id)
DELETE FROM bracket_positions 
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000'::UUID;

-- Delete matches (depends on round_id, player IDs)
DELETE FROM matches 
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000'::UUID;

-- Delete rounds (depends on tournament_id)
DELETE FROM rounds 
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000'::UUID;

-- Delete participants (depends on tournament_id)
DELETE FROM participants 
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000'::UUID;

-- ============================================================================
-- STEP 2: INSERT 64 DUMMY PARTICIPANTS
-- ============================================================================
-- Roll Numbers: 22B81A0001...22B81A0064
-- Names: Participant 1...Participant 64
-- Emails: participant1@test.com...participant64@test.com
-- Mobile: 9999999999 (all same)
-- Seed: 1..64 (deterministic seeding for proper bracket)
-- Status: active
-- Current Round: 1

INSERT INTO participants (
    tournament_id,
    roll_number,
    name,
    email,
    mobile_number,
    seed_number,
    status,
    current_round
)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000'::UUID as tournament_id,
    '22B81A' || LPAD(n::TEXT, 4, '0') as roll_number,
    'Participant ' || n as name,
    'participant' || n || '@test.com' as email,
    '9999999999' as mobile_number,
    n as seed_number,
    'active' as status,
    1 as current_round
FROM generate_series(1, 64) AS n;

-- ============================================================================
-- STEP 3: INSERT ROUNDS (for 64-participant tournament)
-- ============================================================================
-- 6 rounds total:
--   Round 1: 32 matches (64 participants paired)
--   Round 2: 16 matches (32 survivors)
--   Round 3: 8 matches (Quarter Finals)
--   Round 4: 4 matches
--   Round 5: 2 matches (Semi Finals)
--   Round 6: 1 match (Final)

INSERT INTO rounds (
    tournament_id,
    round_number,
    round_name,
    max_participants,
    total_matches,
    status
)
VALUES
    ('550e8400-e29b-41d4-a716-446655440000'::UUID, 1, 'Round 1', 64, 32, 'active'),
    ('550e8400-e29b-41d4-a716-446655440000'::UUID, 2, 'Round 2', 32, 16, 'pending'),
    ('550e8400-e29b-41d4-a716-446655440000'::UUID, 3, 'Quarter Finals', 16, 8, 'pending'),
    ('550e8400-e29b-41d4-a716-446655440000'::UUID, 4, 'Round 4', 8, 4, 'pending'),
    ('550e8400-e29b-41d4-a716-446655440000'::UUID, 5, 'Semi Finals', 4, 2, 'pending'),
    ('550e8400-e29b-41d4-a716-446655440000'::UUID, 6, 'Final', 2, 1, 'pending');

-- ============================================================================
-- STEP 4: GET ALL PARTICIPANT IDs AND CALL BRACKET INITIALIZATION FUNCTION
-- ============================================================================
-- Using existing create_complete_tournament_bracket() function
-- This function handles:
--   - Creating all 63 matches across 6 rounds
--   - Proper tournament bracket seeding (1 vs 64, 2 vs 63, etc.)
--   - Linking matches (winner advancement)
--   - Creating bracket_positions for UI rendering
--   - Processing automatic byes

DO $$ 
DECLARE
    v_participant_ids UUID[];
    v_tournament_id UUID := '550e8400-e29b-41d4-a716-446655440000'::UUID;
    v_result JSON;
BEGIN
    -- Get all 64 participants in seed order (1..64)
    SELECT ARRAY_AGG(id ORDER BY seed_number ASC)
    INTO v_participant_ids
    FROM participants
    WHERE tournament_id = v_tournament_id;
    
    -- Call the bracket initialization function
    -- This uses proper tournament bracket seeding:
    --   Seed 1 vs Seed 64, Seed 2 vs Seed 63, etc.
    SELECT create_complete_tournament_bracket(v_tournament_id, v_participant_ids)
    INTO v_result;
    
    -- Log the result
    RAISE NOTICE 'Bracket creation result: %', v_result;
END $$;

-- ============================================================================
-- STEP 5: VERIFICATION QUERIES
-- ============================================================================
-- Run these manually to verify all data was created correctly

/*
-- Verify participant count
SELECT COUNT(*) as total_participants
FROM participants
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000'::UUID;
-- Expected: 64

-- Verify match counts per round
SELECT 
    r.round_number,
    r.round_name,
    COUNT(m.id) as match_count
FROM rounds r
LEFT JOIN matches m ON r.id = m.round_id
WHERE r.tournament_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
GROUP BY r.id, r.round_number, r.round_name
ORDER BY r.round_number;
-- Expected:
--   Round 1: 32 matches
--   Round 2: 16 matches
--   Round 3: 8 matches
--   Round 4: 4 matches
--   Round 5: 2 matches
--   Round 6: 1 match

-- Verify participant seeding
SELECT seed_number, name, roll_number, status
FROM participants
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
ORDER BY seed_number
LIMIT 5;
-- Expected: Participants 1-5 with correct details

-- Verify Round 1 matches have correct seeding
SELECT 
    m.match_number,
    p1.seed_number as player1_seed,
    p1.name as player1_name,
    p2.seed_number as player2_seed,
    p2.name as player2_name
FROM matches m
LEFT JOIN participants p1 ON m.player1_id = p1.id
LEFT JOIN participants p2 ON m.player2_id = p2.id
WHERE m.tournament_id = '550e8400-e29b-41d4-a716-446655440000'::UUID
AND m.round_number = 1
ORDER BY m.match_number
LIMIT 5;
-- Expected: 
--   Match 1: Seed 1 vs Seed 64
--   Match 2: Seed 32 vs Seed 33
--   Match 3: Seed 16 vs Seed 49
--   etc. (proper bracket seeding)

-- Verify 3rd Year tournament was NOT touched
SELECT COUNT(*) as third_year_participants
FROM participants
WHERE tournament_id = 'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID;
-- Expected: Same count as before this migration (unchanged)

-- Verify bracket_positions are set
SELECT COUNT(*) as positions_created
FROM bracket_positions
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000'::UUID;
-- Expected: 63 (one per match)

-- Check tournament structure
SELECT 
    tournament_id,
    name,
    max_participants,
    num_rounds
FROM tournament
WHERE id = '550e8400-e29b-41d4-a716-446655440000'::UUID;
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Summary:
--   ✓ Deleted old 2nd Year tournament data
--   ✓ Inserted 64 dummy participants (seeds 1-64)
--   ✓ Created 6 rounds with correct match counts
--   ✓ Initialized bracket with proper seeding using create_complete_tournament_bracket()
--   ✓ Did NOT modify tournament row
--   ✓ Did NOT touch 3rd Year tournament
--
-- Next steps:
--   1. Execute this migration in Supabase SQL Editor
--   2. Run verification queries above to confirm all data
--   3. Frontend will automatically fetch and display the 64-participant bracket
--   4. Round 1 should show 32 matches (not 8)
-- ============================================================================

COMMIT;
