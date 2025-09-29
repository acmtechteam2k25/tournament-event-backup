-- Insert single tournament entry for Tournament 2k25
-- This creates one tournament that the entire application will use

INSERT INTO tournament (
  id,
  name,
  description,
  max_participants,
  current_round,
  num_rounds,
  registration_start,
  registration_end,
  tournament_start,
  tournament_end,
  created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'Tournament 2k25',
  'Annual programming tournament featuring 64 participants across 6 exciting rounds',
  64,
  1,
  6,
  '2025-10-04 09:00:00+00'::timestamptz,
  '2025-10-08 23:59:59+00'::timestamptz,
  '2025-10-09 09:00:00+00'::timestamptz,
  '2025-10-11 18:00:00+00'::timestamptz,
  NOW()
);

-- Create the 6 rounds for this tournament
INSERT INTO rounds (tournament_id, round_number, round_name, max_participants, total_matches, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 1, 'Round 1', 64, 32, 'pending'),
('550e8400-e29b-41d4-a716-446655440000', 2, 'Round 2', 32, 16, 'pending'),
('550e8400-e29b-41d4-a716-446655440000', 3, 'Round 3', 16, 8, 'pending'),
('550e8400-e29b-41d4-a716-446655440000', 4, 'Quarter Finals', 8, 4, 'pending'),
('550e8400-e29b-41d4-a716-446655440000', 5, 'Semi Finals', 4, 2, 'pending'),
('550e8400-e29b-41d4-a716-446655440000', 6, 'Final', 2, 1, 'pending');

-- Verify the data was inserted
SELECT 
  id,
  name,
  max_participants,
  current_round,
  num_rounds,
  registration_start AT TIME ZONE 'UTC' as registration_start_utc,
  registration_end AT TIME ZONE 'UTC' as registration_end_utc,
  tournament_start AT TIME ZONE 'UTC' as tournament_start_utc,
  tournament_end AT TIME ZONE 'UTC' as tournament_end_utc
FROM tournament 
WHERE name = 'Tournament 2k25';

-- Show the rounds
SELECT 
  round_number,
  round_name,
  max_participants,
  total_matches,
  status
FROM rounds 
WHERE tournament_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY round_number;
