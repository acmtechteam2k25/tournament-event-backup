-- CRITICAL FIX: Drop and recreate the bracket function
-- Run this in Supabase SQL Editor to fix bracket loading

-- Step 1: Drop the existing function
DROP FUNCTION IF EXISTS get_tournament_bracket(uuid);

-- Step 2: Create the new function with correct signature
CREATE OR REPLACE FUNCTION get_tournament_bracket(p_tournament_id UUID)
RETURNS TABLE (
  match_id UUID,
  round_number INTEGER,
  match_number INTEGER,
  status VARCHAR(20),
  player1 JSON,
  player2 JSON,
  winner_id UUID,
  match_position JSON,
  next_match_id UUID
) AS $$
BEGIN
  RETURN QUERY
    SELECT 
      m.id as match_id,
      m.round_number,
      m.match_number,
      m.status,
      CASE 
        WHEN m.player1_id IS NOT NULL THEN 
          json_build_object(
            'id', p1.id,
            'name', p1.name,
            'roll_number', p1.roll_number,
            'seed_number', p1.seed_number,
            'status', p1.status
          )
        ELSE NULL
      END as player1,
      CASE 
        WHEN m.player2_id IS NOT NULL THEN 
          json_build_object(
            'id', p2.id,
            'name', p2.name,
            'roll_number', p2.roll_number,
            'seed_number', p2.seed_number,
            'status', p2.status
          )
        ELSE NULL
      END as player2,
      m.winner_id,
      CASE 
        WHEN bp.position_x IS NOT NULL THEN 
          json_build_object(
            'x', bp.position_x,
            'y', bp.position_y,
            'column_index', bp.column_index,
            'row_index', bp.row_index
          )
        ELSE NULL
      END as match_position,
      m.next_match_id
    FROM matches m
    LEFT JOIN participants p1 ON m.player1_id = p1.id
    LEFT JOIN participants p2 ON m.player2_id = p2.id
    LEFT JOIN bracket_positions bp ON m.id = bp.match_id
    WHERE m.tournament_id = p_tournament_id
    ORDER BY m.round_number, m.match_number;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Test the function
SELECT 'Function created successfully!' as status;

-- Step 4: Quick test (should return data if tournament exists)
SELECT COUNT(*) as test_count 
FROM get_tournament_bracket('550e8400-e29b-41d4-a716-446655440000');