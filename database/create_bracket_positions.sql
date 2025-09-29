-- SQL to create bracket positions for all 6 rounds
-- This creates the complete bracket layout with proper positioning

-- Round 1: 32 matches (64 participants)
-- These will be created automatically when participants are uploaded via TournamentInitializer

-- Round 2: 16 matches (32 participants) 
INSERT INTO bracket_positions (tournament_id, round_number, position_x, position_y, column_index, row_index)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    2,
    300, -- Move right for round 2
    100 + (ROW_NUMBER() OVER (ORDER BY generate_series) - 1) * 240, -- Double spacing
    1,
    ROW_NUMBER() OVER (ORDER BY generate_series) - 1
FROM generate_series(1, 16);

-- Round 3: 8 matches (16 participants)
INSERT INTO bracket_positions (tournament_id, round_number, position_x, position_y, column_index, row_index)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    3,
    550, -- Move right for round 3
    200 + (ROW_NUMBER() OVER (ORDER BY generate_series) - 1) * 480, -- Quadruple spacing
    2,
    ROW_NUMBER() OVER (ORDER BY generate_series) - 1
FROM generate_series(1, 8);

-- Round 4: Quarter Finals (4 matches, 8 participants)
INSERT INTO bracket_positions (tournament_id, round_number, position_x, position_y, column_index, row_index)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    4,
    800, -- Move right for quarter finals
    400 + (ROW_NUMBER() OVER (ORDER BY generate_series) - 1) * 960, -- More spacing
    3,
    ROW_NUMBER() OVER (ORDER BY generate_series) - 1
FROM generate_series(1, 4);

-- Round 5: Semi Finals (2 matches, 4 participants)
INSERT INTO bracket_positions (tournament_id, round_number, position_x, position_y, column_index, row_index)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    5,
    1050, -- Move right for semi finals
    800 + (ROW_NUMBER() OVER (ORDER BY generate_series) - 1) * 1920, -- Large spacing
    4,
    ROW_NUMBER() OVER (ORDER BY generate_series) - 1
FROM generate_series(1, 2);

-- Round 6: Final (1 match, 2 participants)
INSERT INTO bracket_positions (tournament_id, round_number, position_x, position_y, column_index, row_index)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    6,
    1300, -- Final position
    1600, -- Center vertically
    5,
    0
);

-- View the bracket positions
SELECT 
    round_number,
    COUNT(*) as positions_count,
    MIN(position_y) as min_y,
    MAX(position_y) as max_y,
    position_x
FROM bracket_positions 
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY round_number, position_x
ORDER BY round_number;