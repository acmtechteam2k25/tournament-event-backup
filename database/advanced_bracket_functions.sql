-- ADVANCED TOURNAMENT BRACKET MANAGEMENT
-- This file contains functions to handle complete bracket progression

-- Function to create all tournament rounds and matches at initialization
CREATE OR REPLACE FUNCTION create_complete_tournament_bracket(
    p_tournament_id UUID,
    p_participant_ids UUID[]
) RETURNS JSON AS $$
DECLARE
    v_total_participants INTEGER;
    v_current_participants INTEGER;
    v_round_number INTEGER := 1;
    v_match_counter INTEGER;
    v_previous_round_matches UUID[];
    v_current_round_matches UUID[];
    v_round_id UUID;
    v_match_id UUID;
    v_position_y INTEGER;
    v_position_x INTEGER;
    i INTEGER;
    j INTEGER;
BEGIN
    v_total_participants := array_length(p_participant_ids, 1);
    v_current_participants := v_total_participants;
    
    -- Create all rounds first
    WHILE v_current_participants > 1 LOOP
        INSERT INTO rounds (
            tournament_id, 
            round_number, 
            round_name, 
            max_participants, 
            total_matches,
            status
        ) VALUES (
            p_tournament_id,
            v_round_number,
            CASE 
                WHEN v_round_number = 1 THEN 'Round 1'
                WHEN v_current_participants = 4 THEN 'Semi Finals'
                WHEN v_current_participants = 2 THEN 'Final'
                ELSE 'Round ' || v_round_number
            END,
            v_current_participants,
            v_current_participants / 2,
            CASE WHEN v_round_number = 1 THEN 'active' ELSE 'pending' END
        ) RETURNING id INTO v_round_id;
        
        v_current_participants := v_current_participants / 2;
        v_round_number := v_round_number + 1;
    END LOOP;
    
    -- Reset for match creation
    v_round_number := 1;
    v_current_participants := v_total_participants;
    v_previous_round_matches := ARRAY[]::UUID[];
    
    -- Create matches for each round
    WHILE v_current_participants > 1 LOOP
        v_current_round_matches := ARRAY[]::UUID[];
        v_match_counter := 1;
        
        -- Get round_id
        SELECT id INTO v_round_id 
        FROM rounds 
        WHERE tournament_id = p_tournament_id AND round_number = v_round_number;
        
        -- Create matches for current round
        FOR i IN 1..(v_current_participants / 2) LOOP
            INSERT INTO matches (
                tournament_id,
                round_id,
                round_number,
                match_number,
                player1_id,
                player2_id,
                status
            ) VALUES (
                p_tournament_id,
                v_round_id,
                v_round_number,
                v_match_counter,
                CASE 
                    WHEN v_round_number = 1 THEN 
                        -- Proper tournament bracket seeding using bracket_seeding array
                        p_participant_ids[(ARRAY[1,64,32,33,16,49,17,48,8,57,25,40,9,56,24,41,4,61,29,36,13,52,20,45,5,60,28,37,12,53,21,44,2,63,31,34,15,50,18,47,7,58,26,39,10,55,23,42,3,62,30,35,14,51,19,46,6,59,27,38,11,54,22,43])[(i-1)*2 + 1]]
                    ELSE NULL
                END,
                CASE 
                    WHEN v_round_number = 1 THEN 
                        -- Proper tournament bracket seeding using bracket_seeding array
                        p_participant_ids[(ARRAY[1,64,32,33,16,49,17,48,8,57,25,40,9,56,24,41,4,61,29,36,13,52,20,45,5,60,28,37,12,53,21,44,2,63,31,34,15,50,18,47,7,58,26,39,10,55,23,42,3,62,30,35,14,51,19,46,6,59,27,38,11,54,22,43])[(i-1)*2 + 2]]
                    ELSE NULL
                END,
                CASE 
                    WHEN v_round_number = 1 THEN 'scheduled'
                    ELSE 'pending'
                END
            ) RETURNING id INTO v_match_id;
            
            v_current_round_matches := array_append(v_current_round_matches, v_match_id);
            
            -- Create bracket positions
            v_position_x := (v_round_number - 1) * 300; -- 300px between rounds
            v_position_y := (i - 1) * (120 * POWER(2, v_round_number - 1)); -- Spacing increases with rounds
            
            INSERT INTO bracket_positions (
                tournament_id,
                match_id,
                round_number,
                position_x,
                position_y,
                column_index,
                row_index
            ) VALUES (
                p_tournament_id,
                v_match_id,
                v_round_number,
                v_position_x,
                v_position_y,
                v_round_number - 1,
                i - 1
            );
            
            v_match_counter := v_match_counter + 1;
        END LOOP;
        
        -- Link previous round matches to current round matches (next_match_id)
        IF v_round_number > 1 THEN
            FOR i IN 1..array_length(v_previous_round_matches, 1) LOOP
                v_match_id := v_current_round_matches[(i + 1) / 2]; -- Integer division
                
                UPDATE matches 
                SET next_match_id = v_match_id
                WHERE id = v_previous_round_matches[i];
            END LOOP;
        END IF;
        
        v_previous_round_matches := v_current_round_matches;
        v_current_participants := v_current_participants / 2;
        v_round_number := v_round_number + 1;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Complete tournament bracket created',
        'total_rounds', v_round_number - 1,
        'total_participants', v_total_participants
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'sqlstate', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql;

-- Enhanced function to update match winner with automatic round progression
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
    
    -- Advance winner to next match if it exists
    IF v_next_match_id IS NOT NULL THEN
        UPDATE matches 
        SET 
            player1_id = CASE WHEN player1_id IS NULL THEN p_winner_id ELSE player1_id END,
            player2_id = CASE WHEN player1_id IS NOT NULL AND player2_id IS NULL THEN p_winner_id ELSE player2_id END,
            status = CASE 
                WHEN player1_id IS NOT NULL AND player2_id IS NULL THEN 'scheduled'
                WHEN player1_id IS NULL THEN 'pending'
                ELSE status
            END
        WHERE id = v_next_match_id;
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
        'next_round_activated', v_round_completed
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'sqlstate', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get tournament status and progression
CREATE OR REPLACE FUNCTION get_tournament_status(p_tournament_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'tournament_id', p_tournament_id,
        'rounds', json_agg(
            json_build_object(
                'round_number', round_number,
                'round_name', round_name,
                'status', status,
                'total_matches', total_matches,
                'completed_matches', completed_matches,
                'completion_percentage', 
                CASE 
                    WHEN total_matches > 0 THEN ROUND((completed_matches::DECIMAL / total_matches::DECIMAL) * 100, 2)
                    ELSE 0
                END
            ) ORDER BY round_number
        )
    ) INTO v_result
    FROM rounds
    WHERE tournament_id = p_tournament_id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_complete_tournament_bracket TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_match_winner_advanced TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_tournament_status TO authenticated, anon;