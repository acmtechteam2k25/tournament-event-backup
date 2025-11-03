-- Initialize brackets for all tournaments
-- This will set up the initial bracket structure for 16 participants in each tournament

DO $$ 
DECLARE
  v_tournament_record RECORD;
  v_participant_ids UUID[];
BEGIN
  -- Process each tournament
  FOR v_tournament_record IN 
    SELECT id, name 
    FROM tournament 
    WHERE id IN (
      '11111111-1111-1111-1111-111111111111'::UUID,  -- First Year
      '550e8400-e29b-41d4-a716-446655440000'::UUID,  -- Second Year
      'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID  -- Third/Fourth Year
    )
  LOOP
    -- Get participant IDs for this tournament in seed order
    SELECT array_agg(id ORDER BY seed_number)
    INTO v_participant_ids
    FROM participants
    WHERE tournament_id = v_tournament_record.id;

    -- Initialize bracket for this tournament
    PERFORM initialize_tournament_bracket(v_tournament_record.id, v_participant_ids);
    
    RAISE NOTICE 'Initialized bracket for tournament: %', v_tournament_record.name;
  END LOOP;
END $$;

-- Verify bracket creation
SELECT 
    t.name as tournament_name,
    COUNT(DISTINCT m.id) as match_count,
    COUNT(DISTINCT r.round_number) as round_count,
    COUNT(DISTINCT bp.id) as bracket_positions_count
FROM tournament t
LEFT JOIN matches m ON t.id = m.tournament_id
LEFT JOIN rounds r ON t.id = r.tournament_id
LEFT JOIN bracket_positions bp ON t.id = bp.tournament_id
GROUP BY t.id, t.name
ORDER BY t.name;