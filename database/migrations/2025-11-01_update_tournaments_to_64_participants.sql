-- Migration: Update both active tournaments to 64 participants and 6 rounds
-- Safe to run; uses ON CONFLICT DO UPDATE (upsert pattern).
-- Run ORDER: 2 of 4

-- Update 2nd Year tournament
UPDATE tournament
SET
  max_participants = 64,
  num_rounds       = 6,
  name             = '2nd Year Tournament 2k25'
WHERE id = '550e8400-e29b-41d4-a716-446655440000'::UUID;

-- Update 3rd Year tournament (was "3rd/4th Year")
UPDATE tournament
SET
  max_participants = 64,
  num_rounds       = 6,
  name             = '3rd Year Tournament 2k25'
WHERE id = 'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID;

-- Ensure both tournament rows exist (safe insert if they were never created)
INSERT INTO tournament (id, name, description, max_participants, num_rounds,
                        registration_start, registration_end,
                        tournament_start, tournament_end)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    '2nd Year Tournament 2k25',
    'ACM Tournament 2025 - Second Year Edition',
    64, 6,
    '2025-10-04 09:00:00+00',
    '2025-10-08 23:59:59+00',
    '2025-10-09 09:00:00+00',
    '2025-10-11 18:00:00+00'
  ),
  (
    'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID,
    '3rd Year Tournament 2k25',
    'ACM Tournament 2025 - Third Year Edition',
    64, 6,
    '2025-10-04 09:00:00+00',
    '2025-10-08 23:59:59+00',
    '2025-10-09 09:00:00+00',
    '2025-10-11 18:00:00+00'
  )
ON CONFLICT (id) DO UPDATE
  SET
    name             = EXCLUDED.name,
    description      = EXCLUDED.description,
    max_participants = EXCLUDED.max_participants,
    num_rounds       = EXCLUDED.num_rounds;

-- Verification
SELECT id, name, max_participants, num_rounds
FROM tournament
WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID
)
ORDER BY name;
