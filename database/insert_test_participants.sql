-- Insert sample participants for each tournament (16 per tournament)
-- WITHOUT roll numbers visible in frontend

-- First Year Tournament Participants
DO $$ 
BEGIN
  -- Insert 16 participants for First Year
  INSERT INTO participants (
    tournament_id,
    name,
    roll_number,  -- Empty string as requested
    email,
    seed_number,
    status
  )
  SELECT 
    '11111111-1111-1111-1111-111111111111'::UUID,  -- First Year Tournament ID
    'Player ' || n,  -- Simple player names: Player 1, Player 2, etc.
    '',  -- Empty roll number (won't show in frontend)
    'player' || n || '@example.com',
    n,  -- Seed number same as player number
    'active'
  FROM generate_series(1, 16) n;

  -- Second Year Tournament Participants
  INSERT INTO participants (
    tournament_id,
    name,
    roll_number,
    email,
    seed_number,
    status
  )
  SELECT 
    '550e8400-e29b-41d4-a716-446655440000'::UUID,  -- Second Year Tournament ID
    'Player ' || n,
    '',  -- Empty roll number
    'player' || n || '@example.com',
    n,
    'active'
  FROM generate_series(1, 16) n;

  -- Third/Fourth Year Tournament Participants
  INSERT INTO participants (
    tournament_id,
    name,
    roll_number,
    email,
    seed_number,
    status
  )
  SELECT 
    'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID,  -- Third/Fourth Year Tournament ID
    'Player ' || n,
    '',  -- Empty roll number
    'player' || n || '@example.com',
    n,
    'active'
  FROM generate_series(1, 16) n;
END $$;

-- Verify participants were created for each tournament
SELECT 
    t.name as tournament_name,
    COUNT(p.id) as participant_count,
    MIN(p.seed_number) as min_seed,
    MAX(p.seed_number) as max_seed
FROM tournament t
LEFT JOIN participants p ON t.id = p.tournament_id
GROUP BY t.id, t.name
ORDER BY t.name;