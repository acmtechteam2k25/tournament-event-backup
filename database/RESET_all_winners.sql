-- RESET ALL WINNERS - Use this to restore tournament to initial state
-- This will clear all winner selections and reset matches to their original state

-- Reset all matches (clear winners and set status back to scheduled/pending)
UPDATE matches 
SET 
    winner_id = NULL,
    status = CASE 
        WHEN round_number = 1 THEN 'scheduled'  -- Round 1 matches ready to play
        ELSE 'pending'                          -- Other rounds waiting for participants
    END,
    match_type = 'regular'
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000';

-- Clear Round 2+ participants (keep Round 1 participants intact)
UPDATE matches 
SET 
    player1_id = NULL,
    player2_id = NULL
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000' 
AND round_number > 1;

-- Reset all participant statuses to active (except eliminated)
UPDATE participants 
SET 
    current_round = 1,
    total_wins = 0,
    status = 'active'
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000';

-- Clear all scores from previous matches
DELETE FROM scores 
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000';

-- Reset round completion counters
UPDATE rounds 
SET 
    completed_matches = 0,
    status = CASE 
        WHEN round_number = 1 THEN 'active'  -- Round 1 is active
        ELSE 'pending'                       -- Other rounds are pending
    END
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000';

-- Verification queries (optional - run these to check the reset worked)
-- SELECT 'Matches with winners' as check_type, COUNT(*) as count 
-- FROM matches 
-- WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000' AND winner_id IS NOT NULL;

-- SELECT 'Round 2+ matches with participants' as check_type, COUNT(*) as count 
-- FROM matches 
-- WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000' 
-- AND round_number > 1 
-- AND (player1_id IS NOT NULL OR player2_id IS NOT NULL);

-- SELECT 'Total scores recorded' as check_type, COUNT(*) as count 
-- FROM scores 
-- WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000';

SELECT 'Tournament reset completed successfully!' as result;