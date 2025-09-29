-- Test script to verify tournament data after CSV upload
-- Run this in Supabase SQL editor to check the data

-- 1. Check tournament exists
SELECT 'Tournament' as table_name, count(*) as count 
FROM tournament 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 2. Check participants count
SELECT 'Participants' as table_name, count(*) as count 
FROM participants 
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000';

-- 3. Check rounds
SELECT 'Rounds' as table_name, round_number, count(*) as count
FROM rounds 
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY round_number
ORDER BY round_number;

-- 4. Check matches
SELECT 'Matches' as table_name, round_number, count(*) as count
FROM matches 
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY round_number
ORDER BY round_number;

-- 5. Check bracket positions
SELECT 'Bracket Positions' as table_name, round_number, count(*) as count
FROM bracket_positions 
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY round_number
ORDER BY round_number;

-- 6. Test the fixed bracket function
SELECT 
  'Bracket Function Test' as test_name,
  count(*) as matches_returned
FROM get_tournament_bracket('550e8400-e29b-41d4-a716-446655440000');

-- 7. Sample match data to verify structure
SELECT 
  m.id,
  m.round_number,
  m.match_number,
  p1.name as player1_name,
  p2.name as player2_name,
  m.status
FROM matches m
LEFT JOIN participants p1 ON m.player1_id = p1.id
LEFT JOIN participants p2 ON m.player2_id = p2.id
WHERE m.tournament_id = '550e8400-e29b-41d4-a716-446655440000'
  AND m.round_number = 1
ORDER BY m.match_number
LIMIT 5;