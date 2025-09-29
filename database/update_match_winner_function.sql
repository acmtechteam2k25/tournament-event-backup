-- Create function to update match winner and advance to next round
-- This function will handle both regular wins and walkovers
-- AND automatically create next round matches when needed

CREATE OR REPLACE FUNCTION update_match_winner(
  p_match_id UUID,
  p_winner_id UUID,
  p_winner_score INTEGER DEFAULT 0,
  p_loser_score INTEGER DEFAULT 0,
  p_is_walkover BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
DECLARE
  v_match RECORD;
  v_tournament_id UUID;
  v_round_number INTEGER;
  v_next_round_number INTEGER;
  v_next_match_number INTEGER;
  v_next_round_id UUID;
  v_next_match_id UUID;
  v_current_matches_completed INTEGER;
  v_total_current_round_matches INTEGER;
BEGIN
  -- Get current match details
  SELECT * INTO v_match FROM matches WHERE id = p_match_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match not found';
  END IF;
  
  v_tournament_id := v_match.tournament_id;
  v_round_number := v_match.round_number;
  v_next_round_number := v_round_number + 1;
  
  -- Update the match with winner and scores
  UPDATE matches 
  SET 
    winner_id = p_winner_id,
    winner_score = p_winner_score,
    loser_score = p_loser_score,
    status = 'completed',
    match_type = CASE WHEN p_is_walkover THEN 'walkover' ELSE 'regular' END,
    completed_at = NOW()
  WHERE id = p_match_id;
  
  -- Check if we need to create next round matches
  -- Only create next round if we're not at the final (Round 6)
  IF v_round_number < 6 THEN
    -- Get next round ID
    SELECT id INTO v_next_round_id 
    FROM rounds 
    WHERE tournament_id = v_tournament_id AND round_number = v_next_round_number;
    
    -- Calculate which next round match this winner should go to
    -- For Round 1 (32 matches) -> Round 2 (16 matches): match pairs (1,2)->1, (3,4)->2, etc.
    v_next_match_number := CEIL(v_match.match_number::DECIMAL / 2);
    
    -- Check if next round match already exists
    SELECT id INTO v_next_match_id
    FROM matches 
    WHERE tournament_id = v_tournament_id 
      AND round_number = v_next_round_number 
      AND match_number = v_next_match_number;
    
    -- If next round match doesn't exist, create it
    IF v_next_match_id IS NULL THEN
      INSERT INTO matches (
        tournament_id,
        round_id,
        round_number,
        match_number,
        player1_id,
        player2_id,
        status,
        match_type
      ) VALUES (
        v_tournament_id,
        v_next_round_id,
        v_next_round_number,
        v_next_match_number,
        CASE WHEN v_match.match_number % 2 = 1 THEN p_winner_id ELSE NULL END,
        CASE WHEN v_match.match_number % 2 = 0 THEN p_winner_id ELSE NULL END,
        'scheduled',
        'regular'
      )
      RETURNING id INTO v_next_match_id;
      
      -- Create bracket position for the new match
      INSERT INTO bracket_positions (
        tournament_id,
        round_number,
        position_x,
        position_y,
        column_index,
        row_index,
        match_id
      ) VALUES (
        v_tournament_id,
        v_next_round_number,
        50 + (v_next_round_number - 1) * 250, -- X spacing between rounds
        50 + (v_next_match_number - 1) * (120 * POWER(2, v_next_round_number - 1)), -- Y spacing increases per round
        v_next_round_number - 1,
        v_next_match_number - 1,
        v_next_match_id
      );
    ELSE
      -- Next round match exists, add winner to appropriate slot
      IF v_match.match_number % 2 = 1 THEN
        -- Odd match number goes to player1 slot
        UPDATE matches 
        SET player1_id = p_winner_id 
        WHERE id = v_next_match_id AND player1_id IS NULL;
      ELSE
        -- Even match number goes to player2 slot
        UPDATE matches 
        SET player2_id = p_winner_id 
        WHERE id = v_next_match_id AND player2_id IS NULL;
      END IF;
    END IF;
    
    -- Update next_match_id in current match
    UPDATE matches 
    SET next_match_id = v_next_match_id 
    WHERE id = p_match_id;
  END IF;
  
END;
$$ LANGUAGE plpgsql;