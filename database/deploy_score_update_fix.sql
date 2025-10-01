-- DEPLOYMENT SCRIPT: Fix Score Updates
-- This script updates the update_match_winner_advanced function to properly handle score updates
-- Run this script in your Supabase SQL Editor

-- Drop and recreate the function with improved score handling
DROP FUNCTION IF EXISTS update_match_winner_advanced(UUID, UUID, INTEGER, INTEGER, BOOLEAN);

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
    v_player1_id UUID;
    v_player2_id UUID;
    v_is_bye BOOLEAN := FALSE;
    v_result_type TEXT;
    v_old_winner_id UUID;
    v_next_player1_id UUID;
    v_next_player2_id UUID;
BEGIN
    -- Get match details including current winner (for updates)
    SELECT 
        tournament_id, 
        next_match_id, 
        round_number, 
        round_id, 
        match_number,
        player1_id,
        player2_id,
        winner_id,
        CASE WHEN player1_id = p_winner_id THEN player2_id ELSE player1_id END
    INTO 
        v_tournament_id, 
        v_next_match_id, 
        v_round_number, 
        v_round_id, 
        v_match_number,
        v_player1_id,
        v_player2_id,
        v_old_winner_id,
        v_loser_id
    FROM matches 
    WHERE id = p_match_id;
    
    -- Check if match was found
    IF v_tournament_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Match not found');
    END IF;
    
    -- Determine if this is a bye (one player is NULL/TBD)
    v_is_bye := (v_player1_id IS NULL OR v_player2_id IS NULL);
    
    -- Set result type based on the situation
    v_result_type := CASE 
        WHEN v_is_bye THEN 'bye'
        WHEN p_is_walkover THEN 'walkover'
        ELSE 'regular'
    END;
    
    -- If this is an update (winner changed), handle participant status updates
    IF v_old_winner_id IS NOT NULL AND v_old_winner_id != p_winner_id THEN
        -- Reset old winner status if not already eliminated
        UPDATE participants 
        SET 
            current_round = GREATEST(current_round - 1, 1),
            total_wins = GREATEST(total_wins - 1, 0),
            status = CASE 
                WHEN status = 'champion' THEN 'active'
                ELSE status 
            END
        WHERE id = v_old_winner_id;
        
        -- If old winner had advanced to next match, remove them
        IF v_next_match_id IS NOT NULL THEN
            UPDATE matches 
            SET 
                player1_id = CASE WHEN player1_id = v_old_winner_id THEN NULL ELSE player1_id END,
                player2_id = CASE WHEN player2_id = v_old_winner_id THEN NULL ELSE player2_id END,
                status = CASE 
                    WHEN (player1_id = v_old_winner_id OR player2_id = v_old_winner_id) THEN 'pending'
                    ELSE status
                END
            WHERE id = v_next_match_id;
        END IF;
    END IF;
    
    -- Update match with new winner
    UPDATE matches 
    SET 
        winner_id = p_winner_id, 
        status = 'completed',
        match_type = v_result_type
    WHERE id = p_match_id;
    
    -- Update new winner's participant status
    UPDATE participants 
    SET 
        current_round = CASE WHEN v_next_match_id IS NOT NULL THEN v_round_number + 1 ELSE v_round_number END,
        total_wins = total_wins + 1,
        status = CASE WHEN v_next_match_id IS NULL THEN 'champion' ELSE 'active' END
    WHERE id = p_winner_id;
    
    -- Only eliminate loser if it's not a bye
    IF NOT v_is_bye THEN
        UPDATE participants 
        SET status = 'eliminated'
        WHERE id = v_loser_id;
    END IF;
    
    -- Delete existing scores for this match to handle updates properly
    DELETE FROM scores WHERE match_id = p_match_id;
    
    -- Insert winner score
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
         v_result_type, 'advanced');
    
    -- Insert loser score only if not a bye
    IF NOT v_is_bye THEN
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
            (v_tournament_id, v_loser_id, v_round_id, p_match_id, v_round_number, v_match_number,
             p_loser_score, FALSE, v_result_type, 'eliminated');
    END IF;
    
    -- Advance winner to next match if it exists
    IF v_next_match_id IS NOT NULL THEN
        -- Get current players in next match
        SELECT player1_id, player2_id 
        INTO v_next_player1_id, v_next_player2_id
        FROM matches 
        WHERE id = v_next_match_id;
        
        -- Check if winner is already in the next match (avoid duplicates)
        IF v_next_player1_id = p_winner_id OR v_next_player2_id = p_winner_id THEN
            -- Winner already in next match, skip
        ELSE
            -- Fill the first available slot
            IF v_next_player1_id IS NULL THEN
                -- Fill player1 slot
                UPDATE matches 
                SET 
                    player1_id = p_winner_id,
                    status = CASE WHEN v_next_player2_id IS NOT NULL THEN 'scheduled' ELSE 'pending' END
                WHERE id = v_next_match_id;
            ELSIF v_next_player2_id IS NULL THEN
                -- Fill player2 slot
                UPDATE matches 
                SET 
                    player2_id = p_winner_id,
                    status = 'scheduled' -- Both slots now filled
                WHERE id = v_next_match_id;
            END IF;
        END IF;
    END IF;
    
    -- Update round completion tracking
    UPDATE rounds 
    SET completed_matches = (
        SELECT COUNT(*) FROM matches 
        WHERE round_id = v_round_id AND status = 'completed'
    )
    WHERE id = v_round_id;
    
    -- Check if current round is completed
    SELECT 
        completed_matches >= total_matches,
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
    
    RETURN json_build_object(
        'success', true, 
        'match_id', p_match_id,
        'winner_id', p_winner_id,
        'round_completed', v_round_completed,
        'result_type', v_result_type
    );
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_match_winner_advanced TO authenticated, anon;

-- Verification query (optional - run to test)
-- SELECT update_match_winner_advanced(
--     'your-match-id'::uuid,
--     'your-winner-id'::uuid,
--     10, -- winner score
--     8,  -- loser score
--     false -- is walkover
-- );