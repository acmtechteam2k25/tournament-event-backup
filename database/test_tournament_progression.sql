-- Test Script for Tournament Progression
-- Run this after deploying complete_tournament_setup.sql

-- 1. Check if the database functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('update_match_winner', 'get_tournament_bracket')
  AND routine_schema = 'public';

-- 2. Test the tournament bracket function
SELECT * FROM get_tournament_bracket('550e8400-e29b-41d4-a716-446655440000') 
WHERE round_number = 1 
ORDER BY match_position 
LIMIT 5;

-- 3. Check current Round 1 matches and their status
SELECT 
    match_id,
    round_id as round_number,
    match_position,
    status,
    winner_id,
    CASE WHEN player1_id IS NOT NULL THEN 'Player 1 Set' ELSE 'TBD' END as player1_status,
    CASE WHEN player2_id IS NOT NULL THEN 'Player 2 Set' ELSE 'TBD' END as player2_status
FROM matches 
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000'
  AND round_id = 1
ORDER BY match_position
LIMIT 10;

-- 4. Check if any Round 2 matches exist yet
SELECT COUNT(*) as round2_matches_count
FROM matches 
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000'
  AND round_id = 2;

-- Expected Results:
-- 1. Should show both functions exist
-- 2. Should show Round 1 matches with player data  
-- 3. Should show match details with current winners
-- 4. Should show 0 Round 2 matches initially (they get created automatically)