-- SIMPLIFIED FIX FOR WINNER UPDATE FUNCTION
-- Run this in Supabase SQL Editor

-- First, drop the existing function if it exists
DROP FUNCTION IF EXISTS update_match_winner(UUID, UUID, INTEGER, INTEGER, BOOLEAN);

-- Create a simplified version that focuses on just updating the match
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
    v_match_exists BOOLEAN;
    v_participant_exists BOOLEAN;
BEGIN
    -- Check if match exists
    SELECT EXISTS(SELECT 1 FROM matches WHERE id = p_match_id) INTO v_match_exists;
    IF NOT v_match_exists THEN
        RETURN json_build_object('success', false, 'error', 'Match not found');
    END IF;

    -- Check if winner exists
    SELECT EXISTS(SELECT 1 FROM participants WHERE id = p_winner_id) INTO v_participant_exists;
    IF NOT v_participant_exists THEN
        RETURN json_build_object('success', false, 'error', 'Winner participant not found');
    END IF;

    -- Update the match with winner
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

    -- Return success response
    RETURN json_build_object(
        'success', true, 
        'message', 'Match updated successfully',
        'match_id', p_match_id,
        'winner_id', p_winner_id
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_match_winner TO authenticated, anon;

-- Test the function to make sure it's created
SELECT 'update_match_winner function created successfully!' as status;

-- Show all functions to verify
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%match%';