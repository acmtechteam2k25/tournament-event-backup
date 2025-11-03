-- Insert all three year-wise tournaments
-- Run this after the main schema setup

-- First Year Tournament (16 participants)
INSERT INTO tournament (
    id,
    name,
    description,
    max_participants,
    num_rounds,
    registration_start,
    registration_end,
    tournament_start,
    tournament_end
) VALUES (
    '11111111-1111-1111-1111-111111111111'::UUID,
    '1st Year Tournament 2k25',
    'ACM Tournament 2025 - First Year Edition',
    16,
    4,
    '2025-10-04 09:00:00+00',
    '2025-10-08 23:59:59+00',
    '2025-10-09 09:00:00+00',
    '2025-10-11 18:00:00+00'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    max_participants = EXCLUDED.max_participants,
    num_rounds = EXCLUDED.num_rounds;

-- Second Year Tournament (16 participants)
-- Using the existing UUID from your config
INSERT INTO tournament (
    id,
    name,
    description,
    max_participants,
    num_rounds,
    registration_start,
    registration_end,
    tournament_start,
    tournament_end
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    '2nd Year Tournament 2k25',
    'ACM Tournament 2025 - Second Year Edition',
    16,
    4,
    '2025-10-04 09:00:00+00',
    '2025-10-08 23:59:59+00',
    '2025-10-09 09:00:00+00',
    '2025-10-11 18:00:00+00'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    max_participants = EXCLUDED.max_participants,
    num_rounds = EXCLUDED.num_rounds;

-- Third/Fourth Year Tournament (16 participants)
INSERT INTO tournament (
    id,
    name,
    description,
    max_participants,
    num_rounds,
    registration_start,
    registration_end,
    tournament_start,
    tournament_end
) VALUES (
    'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID,
    '3rd/4th Year Tournament 2k25',
    'ACM Tournament 2025 - Third/Fourth Year Edition',
    16,
    4,
    '2025-10-04 09:00:00+00',
    '2025-10-08 23:59:59+00',
    '2025-10-09 09:00:00+00',
    '2025-10-11 18:00:00+00'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    max_participants = EXCLUDED.max_participants,
    num_rounds = EXCLUDED.num_rounds;

-- Verify the tournaments were created
SELECT 
    id,
    name,
    max_participants,
    num_rounds,
    registration_start,
    tournament_start
FROM tournament
WHERE id IN (
    '11111111-1111-1111-1111-111111111111'::UUID,
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID
)
ORDER BY name;