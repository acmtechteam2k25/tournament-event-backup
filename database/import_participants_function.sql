-- Function to import participants from CSV with empty roll numbers
CREATE OR REPLACE FUNCTION import_participants_from_csv(
    p_tournament_id UUID,
    p_participants TEXT,  -- CSV content: name,email in each line
    p_max_participants INTEGER DEFAULT 16
) RETURNS TABLE (
    status TEXT,
    participants_added INTEGER,
    error_message TEXT
) AS $$
DECLARE
    v_count INTEGER := 0;
    v_line TEXT;
    v_name TEXT;
    v_email TEXT;
    v_lines TEXT[];
    v_tournament_name TEXT;
BEGIN
    -- Get tournament name for logging
    SELECT name INTO v_tournament_name
    FROM tournament
    WHERE id = p_tournament_id;
    
    IF v_tournament_name IS NULL THEN
        RETURN QUERY SELECT 'error'::TEXT, 0, 'Tournament not found'::TEXT;
        RETURN;
    END IF;
    
    -- Split CSV into lines (skip header if it exists)
    v_lines := string_to_array(p_participants, E'\n');
    
    -- Start transaction
    BEGIN
        -- Process each line
        FOR i IN 1..array_length(v_lines, 1) LOOP
            v_line := trim(v_lines[i]);
            
            -- Skip empty lines or header
            IF v_line != '' AND v_line NOT LIKE '%name%email%' THEN
                -- Split line into name,email
                v_name := trim(split_part(v_line, ',', 1));
                v_email := trim(split_part(v_line, ',', 2));
                
                -- Validate line format
                IF v_name = '' OR v_email = '' THEN
                    CONTINUE; -- Skip invalid lines
                END IF;
                
                -- Check if we've reached max participants
                IF v_count >= p_max_participants THEN
                    EXIT; -- Stop after reaching max
                END IF;
                
                -- Insert participant
                INSERT INTO participants (
                    tournament_id,
                    name,
                    roll_number, -- Empty string as requested
                    email,
                    seed_number,
                    status
                ) VALUES (
                    p_tournament_id,
                    v_name,
                    '', -- Empty roll number
                    v_email,
                    v_count + 1, -- Sequential seeding
                    'active'
                );
                
                v_count := v_count + 1;
            END IF;
        END LOOP;
        
        -- Initialize bracket if we have enough participants
        IF v_count > 0 THEN
            -- Get participant IDs in seed order
            DECLARE
                v_participant_ids UUID[];
            BEGIN
                SELECT array_agg(id ORDER BY seed_number)
                INTO v_participant_ids
                FROM participants
                WHERE tournament_id = p_tournament_id;
                
                -- Initialize bracket
                PERFORM initialize_tournament_bracket(p_tournament_id, v_participant_ids);
            END;
        END IF;
        
        -- Return success
        RETURN QUERY SELECT 
            'success'::TEXT,
            v_count,
            format('Added %s participants to %s', v_count, v_tournament_name)::TEXT;
            
    EXCEPTION WHEN OTHERS THEN
        -- Return error
        RETURN QUERY SELECT 
            'error'::TEXT,
            0,
            SQLERRM::TEXT;
    END;
END;
$$ LANGUAGE plpgsql;