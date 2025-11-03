-- Insert 1st Year tournament with 16 participants and 4 rounds

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
  '11111111-1111-1111-1111-111111111111'::uuid,
  '1st Year Tournament 2k25',
  '1st Year knockout tournament with 16 participants',
  16,
  1,
  4,
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '1 day',
  NOW(),
  NOW() + INTERVAL '2 days',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  max_participants = EXCLUDED.max_participants,
  num_rounds = EXCLUDED.num_rounds;

-- Create the 4 rounds for this tournament
INSERT INTO rounds (tournament_id, round_number, round_name, max_participants, total_matches, status) VALUES
('11111111-1111-1111-1111-111111111111', 1, 'Round 1', 16, 8, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO rounds (tournament_id, round_number, round_name, max_participants, total_matches, status) VALUES
('11111111-1111-1111-1111-111111111111', 2, 'Quarter Finals', 8, 4, 'pending')
ON CONFLICT DO NOTHING;

INSERT INTO rounds (tournament_id, round_number, round_name, max_participants, total_matches, status) VALUES
('11111111-1111-1111-1111-111111111111', 3, 'Semi Finals', 4, 2, 'pending')
ON CONFLICT DO NOTHING;

INSERT INTO rounds (tournament_id, round_number, round_name, max_participants, total_matches, status) VALUES
('11111111-1111-1111-1111-111111111111', 4, 'Final', 2, 1, 'pending')
ON CONFLICT DO NOTHING;

-- Verify
SELECT id, name, max_participants, num_rounds FROM tournament WHERE id = '11111111-1111-1111-1111-111111111111';
SELECT round_number, round_name, max_participants, total_matches, status FROM rounds WHERE tournament_id = '11111111-1111-1111-1111-111111111111' ORDER BY round_number;


