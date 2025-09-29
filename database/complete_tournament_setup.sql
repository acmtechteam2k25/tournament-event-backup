-- Complete Database Setup for Tournament Progression
-- This script ensures the database schema supports automatic tournament progression

-- 1. First, ensure the matches table has the required columns
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS match_type VARCHAR(20) DEFAULT 'regular',
ADD COLUMN IF NOT EXISTS next_match_id UUID REFERENCES matches(match_id);

-- 2. Create or replace the update_match_winner function
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
    v_adjacent_match_id UUID;
    v_adjacent_winner_id UUID;
    v_result JSON;
BEGIN
    -- Get match details and the loser
    SELECT 
        CASE 
            WHEN player1_id = p_winner_id THEN player2_id 
            ELSE player1_id 
        END,
        round_id,
        tournament_id,
        match_position
    INTO v_loser_id, v_current_round, v_tournament_id, v_match_position
    FROM matches 
    WHERE match_id = p_match_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Match not found');
    END IF;

    -- Update the current match
    UPDATE matches 
    SET 
        winner_id = p_winner_id,
        status = 'completed',
        match_type = CASE WHEN p_is_walkover THEN 'walkover' ELSE 'regular' END,
        updated_at = NOW()
    WHERE match_id = p_match_id;

    -- Update scores if not walkover
    IF NOT p_is_walkover THEN
        DELETE FROM scores WHERE match_id = p_match_id;
        
        INSERT INTO scores (match_id, participant_id, score, is_winner)
        VALUES (p_match_id, p_winner_id, p_winner_score, true);
        
        INSERT INTO scores (match_id, participant_id, score, is_winner)
        VALUES (p_match_id, v_loser_id, p_loser_score, false);
    END IF;

    -- Find adjacent match (for consecutive match pairing)
    -- If current match is odd position, find even position (current + 1)
    -- If current match is even position, find odd position (current - 1)
    IF v_match_position % 2 = 1 THEN
        -- Odd position, look for even (next) match
        SELECT match_id, winner_id INTO v_adjacent_match_id, v_adjacent_winner_id
        FROM matches 
        WHERE tournament_id = v_tournament_id 
          AND round_id = v_current_round 
          AND match_position = v_match_position + 1
          AND status = 'completed';
    ELSE
        -- Even position, look for odd (previous) match  
        SELECT match_id, winner_id INTO v_adjacent_match_id, v_adjacent_winner_id
        FROM matches 
        WHERE tournament_id = v_tournament_id 
          AND round_id = v_current_round 
          AND match_position = v_match_position - 1
          AND status = 'completed';
    END IF;

    -- If adjacent match is complete, create next round match
    IF v_adjacent_match_id IS NOT NULL AND v_adjacent_winner_id IS NOT NULL THEN
        -- Calculate next round position (consecutive matches pair up)
        v_next_position := CEIL(GREATEST(v_match_position, 
                                        CASE WHEN v_match_position % 2 = 1 
                                             THEN v_match_position + 1 
                                             ELSE v_match_position - 1 END)::FLOAT / 2)::INTEGER;
        
        -- Check if next round match already exists
        SELECT match_id INTO v_next_match_id
        FROM matches 
        WHERE tournament_id = v_tournament_id 
          AND round_id = v_current_round + 1 
          AND match_position = v_next_position;
          
        IF v_next_match_id IS NULL THEN
            -- Create next round match with both winners
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
                CASE WHEN v_match_position < (CASE WHEN v_match_position % 2 = 1 THEN v_match_position + 1 ELSE v_match_position - 1 END)
                     THEN p_winner_id ELSE v_adjacent_winner_id END,
                CASE WHEN v_match_position < (CASE WHEN v_match_position % 2 = 1 THEN v_match_position + 1 ELSE v_match_position - 1 END)
                     THEN v_adjacent_winner_id ELSE p_winner_id END,
                'pending',
                NOW(),
                NOW()
            )
            RETURNING match_id INTO v_next_match_id;
            
            -- Update both completed matches with next_match_id
            UPDATE matches 
            SET next_match_id = v_next_match_id
            WHERE match_id IN (p_match_id, v_adjacent_match_id);
            
            -- Create bracket positions for next round
            INSERT INTO bracket_positions (tournament_id, participant_id, round_number, bracket_position)
            VALUES 
                (v_tournament_id, p_winner_id, v_current_round + 1, v_next_position * 2 - 1),
                (v_tournament_id, v_adjacent_winner_id, v_current_round + 1, v_next_position * 2)
            ON CONFLICT (tournament_id, participant_id, round_number) 
            DO UPDATE SET 
                bracket_position = EXCLUDED.bracket_position,
                updated_at = NOW();
        END IF;
    END IF;

    -- Return success
    RETURN json_build_object(
        'success', true, 
        'match_id', p_match_id,
        'winner_id', p_winner_id,
        'next_match_id', v_next_match_id,
        'is_walkover', p_is_walkover,
        'next_round_created', v_next_match_id IS NOT NULL
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false, 
        'error', SQLERRM
    );
END;
$$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION update_match_winner TO authenticated, anon;

-- 4. Ensure get_tournament_bracket function exists and works properly
CREATE OR REPLACE FUNCTION get_tournament_bracket(p_tournament_id UUID)
RETURNS TABLE (
    match_id UUID,
    round_number INTEGER,
    match_position INTEGER,
    status VARCHAR,
    match_type VARCHAR,
    winner_id UUID,
    next_match_id UUID,
    player1 JSONB,
    player2 JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.match_id,
        m.round_id as round_number,
        m.match_position,
        m.status,
        COALESCE(m.match_type, 'regular') as match_type,
        m.winner_id,
        m.next_match_id,
        CASE 
            WHEN m.player1_id IS NOT NULL THEN
                json_build_object(
                    'id', p1.participant_id,
                    'name', p1.name,
                    'seed_number', p1.seed_number,
                    'status', COALESCE(p1.status, 'active')
                )::jsonb
            ELSE NULL
        END as player1,
        CASE 
            WHEN m.player2_id IS NOT NULL THEN
                json_build_object(
                    'id', p2.participant_id,
                    'name', p2.name,
                    'seed_number', p2.seed_number,
                    'status', COALESCE(p2.status, 'active')
                )::jsonb
            ELSE NULL
        END as player2
    FROM matches m
    LEFT JOIN participants p1 ON m.player1_id = p1.participant_id
    LEFT JOIN participants p2 ON m.player2_id = p2.participant_id
    WHERE m.tournament_id = p_tournament_id
    ORDER BY m.round_id, m.match_position;
END;
$$;

GRANT EXECUTE ON FUNCTION get_tournament_bracket TO authenticated, anon;