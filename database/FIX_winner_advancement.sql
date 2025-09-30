-- FIX for winner advancement issue
-- The problem is in the UPDATE logic of update_match_winner_advanced function
-- This creates a corrected version that properly advances winners to next matches

CREATE OR REPLACE FUNCTION update_match_winner_advanced(
    p_match_id UUID,
    p_winner_id UUID,
    p_winner_score INTEGER DEFAULT 0,
    p_loser_score INTEGER DEFAULT 0,
    p_is_walkover BOOLEAN DEFAULT FALSE
) RETURNS JSON AS $$
DECLARE
    v_tournament_id UUID;
    v_next_match_id UUID;
    v_round_number INTEGER;
    v_round_id UUID;
    v_loser_id UUID;
    v_match_number INTEGER;
    v_next_round_number INTEGER;
    v_next_round_id UUID;
    v_round_completed BOOLEAN := FALSE;
    v_next_match_player1_id UUID;
    v_next_match_player2_id UUID;
BEGIN
    -- Get match details
    SELECT 
        tournament_id, 
        next_match_id, 
        round_number, 
        round_id, 
        match_number,
        CASE WHEN player1_id = p_winner_id THEN player2_id ELSE player1_id END
    INTO 
        v_tournament_id, 
        v_next_match_id, 
        v_round_number, 
        v_round_id, 
        v_match_number, 
        v_loser_id
    FROM matches 
    WHERE id = p_match_id;
    
    -- Check if match was found
    IF v_tournament_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Match not found');
    END IF;
    
    -- Update match with winner
    UPDATE matches 
    SET 
        winner_id = p_winner_id, 
        status = 'completed',
        match_type = CASE WHEN p_is_walkover THEN 'walkover' ELSE 'regular' END
    WHERE id = p_match_id;
    
    -- Update participants
    UPDATE participants 
    SET 
        current_round = CASE WHEN v_next_match_id IS NOT NULL THEN v_round_number + 1 ELSE v_round_number END,
        total_wins = total_wins + 1,
        status = CASE WHEN v_next_match_id IS NULL THEN 'champion' ELSE 'active' END
    WHERE id = p_winner_id;
    
    UPDATE participants 
    SET status = 'eliminated'
    WHERE id = v_loser_id;
    
    -- Insert scores
    INSERT INTO scores (
        tournament_id, 
        player_id, 
        round_id, 
        match_id, 
        round_number, 
        match_number, 
        score, 
        is_winner, 
        result_type, 
        advancement_status
    ) VALUES 
        (v_tournament_id, p_winner_id, v_round_id, p_match_id, v_round_number, v_match_number,
         p_winner_score, TRUE, 
         CASE WHEN p_is_walkover THEN 'walkover' ELSE 'regular' END, 'advanced'),
        (v_tournament_id, v_loser_id, v_round_id, p_match_id, v_round_number, v_match_number,
         p_loser_score, FALSE, 
         CASE WHEN p_is_walkover THEN 'walkover' ELSE 'regular' END, 'eliminated');
    
    -- FIXED: Advance winner to next match if it exists
    IF v_next_match_id IS NOT NULL THEN
        -- First get current state of next match
        SELECT player1_id, player2_id 
        INTO v_next_match_player1_id, v_next_match_player2_id
        FROM matches 
        WHERE id = v_next_match_id;
        
        -- Then update based on current state
        IF v_next_match_player1_id IS NULL THEN
            -- First slot is empty, put winner there
            UPDATE matches 
            SET 
                player1_id = p_winner_id,
                status = CASE WHEN v_next_match_player2_id IS NOT NULL THEN 'scheduled' ELSE 'pending' END
            WHERE id = v_next_match_id;
        ELSIF v_next_match_player2_id IS NULL THEN
            -- Second slot is empty, put winner there
            UPDATE matches 
            SET 
                player2_id = p_winner_id,
                status = 'scheduled'  -- Both slots filled, ready to play
            WHERE id = v_next_match_id;
        END IF;
    END IF;
    
    -- Update round completion and check if round is finished
    UPDATE rounds 
    SET completed_matches = completed_matches + 1
    WHERE id = v_round_id;
    
    -- Check if current round is completed
    SELECT 
        (completed_matches + 1) >= total_matches,
        round_number + 1
    INTO v_round_completed, v_next_round_number
    FROM rounds 
    WHERE id = v_round_id;
    
    -- If round is completed, activate next round
    IF v_round_completed THEN
        -- Mark current round as completed
        UPDATE rounds 
        SET status = 'completed'
        WHERE id = v_round_id;
        
        -- Activate next round if it exists
        UPDATE rounds 
        SET status = 'active'
        WHERE tournament_id = v_tournament_id 
        AND round_number = v_next_round_number;
    END IF;
    
    -- Return success response with additional info
    RETURN json_build_object(
        'success', true,
        'message', 'Match updated successfully',
        'match_id', p_match_id,
        'winner_id', p_winner_id,
        'next_match_id', v_next_match_id,
        'round_completed', v_round_completed,
        'next_round_activated', v_round_completed,
        'debug_info', json_build_object(
            'next_match_player1_before', v_next_match_player1_id,
            'next_match_player2_before', v_next_match_player2_id,
            'winner_placed_in_slot', 
                CASE 
                    WHEN v_next_match_player1_id IS NULL THEN 'player1'
                    WHEN v_next_match_player2_id IS NULL THEN 'player2'
                    ELSE 'error_no_slot_available'
                END
        )
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'sqlstate', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql;