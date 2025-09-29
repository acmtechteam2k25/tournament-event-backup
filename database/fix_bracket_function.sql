-- Fix the get_tournament_bracket function to remove match_name reference

CREATE OR REPLACE FUNCTION get_tournament_bracket(p_tournament_id UUID)
RETURNS TABLE (
  match_id UUID,
  round_number INTEGER,
  match_number INTEGER,
  status VARCHAR,
  winner_id UUID,
  next_match_id UUID,
  player1 JSONB,
  player2 JSONB,
  match_position JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as match_id,
    m.round_number,
    m.match_number,
    m.status,
    m.winner_id,
    m.next_match_id,
    CASE WHEN p1.id IS NOT NULL THEN
      jsonb_build_object(
        'id', p1.id,
        'name', p1.name,
        'roll_number', p1.roll_number,
        'seed', p1.seed_number,
        'status', p1.status
      )
    ELSE NULL END as player1,
    CASE WHEN p2.id IS NOT NULL THEN
      jsonb_build_object(
        'id', p2.id,
        'name', p2.name,
        'roll_number', p2.roll_number,
        'seed', p2.seed_number,
        'status', p2.status
      )
    ELSE NULL END as player2,
    CASE WHEN bp.id IS NOT NULL THEN
      jsonb_build_object(
        'x', bp.position_x,
        'y', bp.position_y,
        'column', bp.column_index,
        'row', bp.row_index
      )
    ELSE NULL END as match_position
  FROM matches m
  LEFT JOIN participants p1 ON m.player1_id = p1.id
  LEFT JOIN participants p2 ON m.player2_id = p2.id
  LEFT JOIN bracket_positions bp ON m.id = bp.match_id
  WHERE m.tournament_id = p_tournament_id
  ORDER BY m.round_number, m.match_number;
END;
$$ LANGUAGE plpgsql;