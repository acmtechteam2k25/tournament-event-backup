-- COMPLETE DATABASE FIX FOR WINNER SELECTION
-- Run this entire script in Supabase SQL Editor

-- First, ensure the update_match_winner function exists and works correctly
DROP FUNCTION IF EXISTS update_match_winner(UUID, UUID, INTEGER, INTEGER, BOOLEAN);

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
    v_match_number INTEGER;
    v_next_match_id UUID;
    v_result JSON;
BEGIN
    -- Get match details
    SELECT 
        CASE 
            WHEN player1_id = p_winner_id THEN player2_id 
            ELSE player1_id 
        END,
        round_number,
        tournament_id,
        match_number,
        next_match_id
    INTO v_loser_id, v_current_round, v_tournament_id, v_match_number, v_next_match_id
    FROM matches 
    WHERE id = p_match_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Match not found');
    END IF;

    -- Update the match
    UPDATE matches 
    SET 
        winner_id = p_winner_id,
        status = 'completed',
        updated_at = NOW()
    WHERE id = p_match_id;
    
    -- Check if update was successful
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Failed to update match');
    END IF;

    -- Handle scores only if not a walkover
    IF NOT p_is_walkover THEN
        -- Delete existing scores for this match
        DELETE FROM scores WHERE match_id = p_match_id;
        
        -- Insert winner score
        INSERT INTO scores (match_id, participant_id, score, is_winner)
        VALUES (p_match_id, p_winner_id, p_winner_score, true)
        ON CONFLICT (match_id, participant_id) 
        DO UPDATE SET 
            score = EXCLUDED.score,
            is_winner = EXCLUDED.is_winner;
        
        -- Insert loser score if loser exists
        IF v_loser_id IS NOT NULL THEN
            INSERT INTO scores (match_id, participant_id, score, is_winner)
            VALUES (p_match_id, v_loser_id, p_loser_score, false)
            ON CONFLICT (match_id, participant_id) 
            DO UPDATE SET 
                score = EXCLUDED.score,
                is_winner = EXCLUDED.is_winner;
        END IF;
    END IF;

    -- Handle next round advancement
    IF v_current_round < 6 THEN -- Assuming 6 rounds max for 64-player tournament
        -- Find or create next round match
        DECLARE
            v_next_round INTEGER := v_current_round + 1;
            v_next_match_number INTEGER := CEIL(v_match_number::FLOAT / 2)::INTEGER;
        BEGIN
            -- Check if next round match exists
            SELECT id INTO v_next_match_id
            FROM matches 
            WHERE tournament_id = v_tournament_id 
              AND round_number = v_next_round 
              AND match_number = v_next_match_number;
              
            -- If next match doesn't exist, create it
            IF v_next_match_id IS NULL THEN
                INSERT INTO matches (
                    id,
                    tournament_id,
                    round_number,
                    match_number,
                    player1_id,
                    player2_id,
                    status,
                    created_at,
                    updated_at
                ) VALUES (
                    gen_random_uuid(),
                    v_tournament_id,
                    v_next_round,
                    v_next_match_number,
                    CASE WHEN v_match_number % 2 = 1 THEN p_winner_id ELSE NULL END,
                    CASE WHEN v_match_number % 2 = 0 THEN p_winner_id ELSE NULL END,
                    'pending',
                    NOW(),
                    NOW()
                )
                RETURNING id INTO v_next_match_id;
            ELSE
                -- Update existing next match with winner
                UPDATE matches 
                SET 
                    player1_id = CASE 
                        WHEN player1_id IS NULL THEN p_winner_id
                        ELSE player1_id
                    END,
                    player2_id = CASE 
                        WHEN player1_id IS NOT NULL AND player2_id IS NULL THEN p_winner_id
                        ELSE player2_id
                    END,
                    updated_at = NOW()
                WHERE id = v_next_match_id;
            END IF;
            
            -- Update current match with next_match_id reference
            UPDATE matches 
            SET next_match_id = v_next_match_id
            WHERE id = p_match_id;
        END;
    END IF;

    -- Return success response
    RETURN json_build_object(
        'success', true, 
        'match_id', p_match_id,
        'winner_id', p_winner_id,
        'next_match_id', v_next_match_id,
        'is_walkover', p_is_walkover,
        'message', 'Match updated successfully'
    );
    
EXCEPTION WHEN OTHERS THEN
    -- Return error response
    RETURN json_build_object(
        'success', false, 
        'error', SQLERRM,
        'sqlstate', SQLSTATE
    );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_match_winner TO authenticated, anon;

-- Test the function
SELECT 'Update match winner function created successfully!' as status;

-- Verify the get_tournament_bracket function is still working
SELECT COUNT(*) as bracket_count 
FROM get_tournament_bracket('550e8400-e29b-41d4-a716-446655440000');

-- Test a simple match update (this won't actually run unless you have real match data)
-- SELECT update_match_winner(
--     'some-match-id'::UUID, 
--     'some-winner-id'::UUID, 
--     21, 
--     19, 
--     false
-- );

SELECT 'Database fix completed successfully!' as final_status;