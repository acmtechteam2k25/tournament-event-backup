-- Update all existing tournaments to have 16 participants and 4 rounds
UPDATE tournament
SET max_participants = 16,
    num_rounds = 4
WHERE max_participants > 16;

-- Update the name of the third year tournament to include 4th year
UPDATE tournament
SET name = '3rd/4th Year Tournament 2k25'
WHERE id = 'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234';

-- Update round names for clarity and consistency
UPDATE rounds
SET round_name = 
    CASE 
        WHEN round_number = 1 THEN 'Round 1'
        WHEN round_number = 2 THEN 'Quarter Final'
        WHEN round_number = 3 THEN 'Semi Final'
        WHEN round_number = 4 THEN 'Final'
    END
WHERE tournament_id IN (
    SELECT id FROM tournament
);

-- Update matches table to ensure all matches are within the 4-round structure
DELETE FROM matches 
WHERE round_number > 4;

-- Reset any participants that were in rounds beyond round 4
UPDATE participants
SET current_round = LEAST(current_round, 4)
WHERE current_round > 4;

-- Update max_participants in rounds table to reflect new tournament structure
UPDATE rounds
SET max_participants = 
    CASE 
        WHEN round_number = 1 THEN 16
        WHEN round_number = 2 THEN 8
        WHEN round_number = 3 THEN 4
        WHEN round_number = 4 THEN 2
    END
WHERE tournament_id IN (
    SELECT id FROM tournament
);

-- Update total_matches in rounds table
UPDATE rounds
SET total_matches = 
    CASE 
        WHEN round_number = 1 THEN 8  -- 16 participants = 8 matches
        WHEN round_number = 2 THEN 4  -- 8 participants = 4 matches
        WHEN round_number = 3 THEN 2  -- 4 participants = 2 matches
        WHEN round_number = 4 THEN 1  -- 2 participants = 1 match
    END
WHERE tournament_id IN (
    SELECT id FROM tournament
);