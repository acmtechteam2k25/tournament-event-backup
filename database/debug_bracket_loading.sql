-- Test queries to debug bracket loading issue
-- Run these in Supabase SQL Editor to check data

-- 1. Check if tournament exists
SELECT 'Tournament Check' as test, count(*) as count 
FROM tournament 
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 2. Check participants with seeding
SELECT 'Participants' as test, count(*) as total_count,
       min(seed_number) as min_seed,
       max(seed_number) as max_seed
FROM participants 
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000';

-- 3. Check matches
SELECT 'Matches' as test, round_number, count(*) as match_count
FROM matches 
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY round_number
ORDER BY round_number;

-- 4. Check bracket positions
SELECT 'Bracket Positions' as test, count(*) as position_count
FROM bracket_positions 
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000';

-- 5. Test bracket function (this will show the error if it exists)
-- SELECT * FROM get_tournament_bracket('550e8400-e29b-41d4-a716-446655440000') LIMIT 5;

-- 6. Check seeding distribution in matches (should show proper seed pairings)
SELECT 
  m.match_number,
  p1.seed_number as player1_seed,
  p1.name as player1_name,
  p2.seed_number as player2_seed,
  p2.name as player2_name
FROM matches m
LEFT JOIN participants p1 ON m.player1_id = p1.id
LEFT JOIN participants p2 ON m.player2_id = p2.id
WHERE m.tournament_id = '550e8400-e29b-41d4-a716-446655440000'
  AND m.round_number = 1
ORDER BY m.match_number
LIMIT 10;