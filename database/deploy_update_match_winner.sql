-- Deploy the update_match_winner function to Supabase
-- This function handles match winner updates and automatically generates next round matches

CREATE OR REPLACE FUNCTION update_match_winner(
    p_match_id UUID,
    p_winner_id UUID,
    p_winner_score INTEGER DEFAULT 0,
    p_loser_score INTEGER DEFAULT 0,
    p_is_walkover BOOLEAN DEFAULT FALSE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_loser_id UUID;
    v_current_round INTEGER;
    v_tournament_id UUID;
    v_match_position INTEGER;
    v_next_match_id UUID;
    v_next_position INTEGER;
    v_winner_bracket_pos INTEGER;
    v_result JSON;
BEGIN
    -- Get match details
    SELECT 
        CASE 
            WHEN player1_id = p_winner_id THEN player2_id 
            ELSE player1_id 
        END,
        round_id,
        tournament_id,
        match_position,
        next_match_id
    INTO v_loser_id, v_current_round, v_tournament_id, v_match_position, v_next_match_id
    FROM matches 
    WHERE match_id = p_match_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Match not found');
    END IF;

    -- Update the match
    UPDATE matches 
    SET 
        winner_id = p_winner_id,
        status = 'completed',
        match_type = CASE WHEN p_is_walkover THEN 'walkover' ELSE 'regular' END,
        updated_at = NOW()
    WHERE match_id = p_match_id;

    -- Update or insert scores
    IF NOT p_is_walkover THEN
        -- Delete existing scores for this match
        DELETE FROM scores WHERE match_id = p_match_id;
        
        -- Insert winner score
        INSERT INTO scores (match_id, participant_id, score, is_winner)
        VALUES (p_match_id, p_winner_id, p_winner_score, true);
        
        -- Insert loser score
        INSERT INTO scores (match_id, participant_id, score, is_winner)
        VALUES (p_match_id, v_loser_id, p_loser_score, false);
    END IF;

    -- Check if we need to create next round match
    IF v_next_match_id IS NULL THEN
        -- Calculate next round position for winner
        v_next_position := CEIL(v_match_position::FLOAT / 2)::INTEGER;
        
        -- Check if next round match already exists
        SELECT match_id INTO v_next_match_id
        FROM matches 
        WHERE tournament_id = v_tournament_id 
          AND round_id = v_current_round + 1 
          AND match_position = v_next_position;
          
        -- If next match doesn't exist, create it
        IF v_next_match_id IS NULL THEN
            INSERT INTO matches (
                match_id,
                tournament_id,
                round_id,
                match_position,
                player1_id,
                player2_id,
                status,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                v_tournament_id,
                v_current_round + 1,
                v_next_position,
                CASE WHEN v_match_position % 2 = 1 THEN p_winner_id ELSE NULL END,
                CASE WHEN v_match_position % 2 = 0 THEN p_winner_id ELSE NULL END,
                'pending',
                NOW(),
                NOW()
            )
            RETURNING match_id INTO v_next_match_id;
        ELSE
            -- Update existing next match with winner
            UPDATE matches 
            SET 
                player2_id = CASE 
                    WHEN player1_id IS NULL THEN NULL
                    WHEN player1_id IS NOT NULL AND player2_id IS NULL THEN p_winner_id
                    ELSE player2_id
                END,
                player1_id = CASE 
                    WHEN player1_id IS NULL THEN p_winner_id
                    ELSE player1_id
                END,
                updated_at = NOW()
            WHERE match_id = v_next_match_id;
        END IF;
        
        -- Update current match with next_match_id
        UPDATE matches 
        SET next_match_id = v_next_match_id
        WHERE match_id = p_match_id;
        
        -- Create or update bracket position for the winner in next round
        SELECT bracket_position INTO v_winner_bracket_pos
        FROM bracket_positions 
        WHERE tournament_id = v_tournament_id 
          AND participant_id = p_winner_id 
          AND round_number = v_current_round;
          
        IF v_winner_bracket_pos IS NOT NULL THEN
            -- Calculate next round bracket position
            v_winner_bracket_pos := CEIL(v_winner_bracket_pos::FLOAT / 2)::INTEGER;
            
            INSERT INTO bracket_positions (
                tournament_id,
                participant_id,
                round_number,
                bracket_position
            ) VALUES (
                v_tournament_id,
                p_winner_id,
                v_current_round + 1,
                v_winner_bracket_pos
            )
            ON CONFLICT (tournament_id, participant_id, round_number) 
            DO UPDATE SET 
                bracket_position = EXCLUDED.bracket_position,
                updated_at = NOW();
        END IF;
    END IF;

    -- Return success response
    RETURN json_build_object(
        'success', true, 
        'match_id', p_match_id,
        'winner_id', p_winner_id,
        'next_match_id', v_next_match_id,
        'is_walkover', p_is_walkover
    );
    
EXCEPTION WHEN OTHERS THEN
    -- Return error response
    RETURN json_build_object(
        'success', false, 
        'error', SQLERRM
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_match_winner TO authenticated, anon;