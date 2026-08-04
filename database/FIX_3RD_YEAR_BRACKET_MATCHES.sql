-- ============================================================================
-- FIX_3RD_YEAR_BRACKET_MATCHES.sql
-- Tournament: 3rd Year Tournament 2k25
-- Tournament ID: d6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234
--
-- Current state:
--   tournament  : max_participants=64, num_rounds=6   (correct, untouched)
--   rounds      : 6 rows with 64-player config        (correct, untouched)
--   matches     : 15 stale rows from 16-player init   (REPLACED below)
--   bracket_pos : 15 stale rows                       (REPLACED below)
--   participants: 0 rows                              (untouched)
--   scores      : 0 rows                              (untouched)
--
-- What this script does:
--   1. Deletes the 15 incorrect matches for this tournament only
--   2. Deletes the 15 incorrect bracket_positions for this tournament only
--   3. Inserts 63 empty matches (NULL players) across 6 rounds
--      with correct round_id, match_number, status, and next_match_id linkage
--   4. Inserts 63 bracket_positions using the same coordinate formula
--      as create_complete_tournament_bracket in advanced_bracket_functions.sql:
--        position_x = (round_number - 1) * 300
--        position_y = (i - 1) * (120 * 2^(round_number-1))
--        column_index = round_number - 1
--        row_index = i - 1
--
-- Match counts: 32 + 16 + 8 + 4 + 2 + 1 = 63
-- Bracket pos:  32 + 16 + 8 + 4 + 2 + 1 = 63
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Remove stale data for 3rd Year only
-- ============================================================================

DELETE FROM bracket_positions
WHERE tournament_id = 'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID;

DELETE FROM matches
WHERE tournament_id = 'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID;

-- ============================================================================
-- STEP 2: Insert 63 matches + 63 bracket_positions
--
-- Strategy: use a DO block with temp arrays to capture inserted match IDs
-- so next_match_id can be wired correctly between rounds.
--
-- The linking rule (from advanced_bracket_functions.sql):
--   for each match i in previous round:
--     next_match_id = current_round_matches[(i+1)/2]  (integer division)
--   i.e. matches 1&2 → next match 1, matches 3&4 → next match 2, etc.
-- ============================================================================

DO $$
DECLARE
  v_tid UUID := 'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID;

  -- round_id for each of the 6 existing rounds
  v_rid1  UUID;
  v_rid2  UUID;
  v_rid3  UUID;
  v_rid4  UUID;
  v_rid5  UUID;
  v_rid6  UUID;

  -- arrays to hold inserted match IDs per round
  v_r1  UUID[] := ARRAY[]::UUID[];
  v_r2  UUID[] := ARRAY[]::UUID[];
  v_r3  UUID[] := ARRAY[]::UUID[];
  v_r4  UUID[] := ARRAY[]::UUID[];
  v_r5  UUID[] := ARRAY[]::UUID[];
  v_r6  UUID[] := ARRAY[]::UUID[];

  v_mid  UUID;
  i      INTEGER;

  -- bracket_position coordinates (mirroring advanced_bracket_functions.sql)
  v_px   INTEGER;
  v_py   INTEGER;

BEGIN

  -- Fetch the existing round IDs (created by earlier migration, untouched)
  SELECT id INTO v_rid1 FROM rounds WHERE tournament_id = v_tid AND round_number = 1;
  SELECT id INTO v_rid2 FROM rounds WHERE tournament_id = v_tid AND round_number = 2;
  SELECT id INTO v_rid3 FROM rounds WHERE tournament_id = v_tid AND round_number = 3;
  SELECT id INTO v_rid4 FROM rounds WHERE tournament_id = v_tid AND round_number = 4;
  SELECT id INTO v_rid5 FROM rounds WHERE tournament_id = v_tid AND round_number = 5;
  SELECT id INTO v_rid6 FROM rounds WHERE tournament_id = v_tid AND round_number = 6;

  IF v_rid1 IS NULL THEN RAISE EXCEPTION 'Round 1 not found for tournament %', v_tid; END IF;
  IF v_rid2 IS NULL THEN RAISE EXCEPTION 'Round 2 not found for tournament %', v_tid; END IF;
  IF v_rid3 IS NULL THEN RAISE EXCEPTION 'Round 3 not found for tournament %', v_tid; END IF;
  IF v_rid4 IS NULL THEN RAISE EXCEPTION 'Round 4 not found for tournament %', v_tid; END IF;
  IF v_rid5 IS NULL THEN RAISE EXCEPTION 'Round 5 not found for tournament %', v_tid; END IF;
  IF v_rid6 IS NULL THEN RAISE EXCEPTION 'Round 6 not found for tournament %', v_tid; END IF;

  --------------------------------------------------------------------------
  -- ROUND 1: 32 matches
  -- status = 'scheduled' (no players yet, but round 1 is the entry point)
  -- position_x = 0, position_y = (i-1)*120, column_index=0, row_index=i-1
  --------------------------------------------------------------------------
  FOR i IN 1..32 LOOP
    INSERT INTO matches (
      tournament_id, round_id, round_number, match_number,
      player1_id, player2_id, winner_id,
      status, match_type,
      redirect_url
    ) VALUES (
      v_tid, v_rid1, 1, i,
      NULL, NULL, NULL,
      'scheduled', 'regular',
      'https://vnrvjiet.acm.org'
    ) RETURNING id INTO v_mid;

    v_r1 := array_append(v_r1, v_mid);

    -- bracket_positions: same formula as advanced_bracket_functions.sql
    -- round 1: position_x = 0, position_y = (i-1)*120
    v_px := 0;
    v_py := (i - 1) * 120;

    INSERT INTO bracket_positions (
      tournament_id, match_id, round_number,
      position_x, position_y, column_index, row_index
    ) VALUES (
      v_tid, v_mid, 1,
      v_px, v_py, 0, i - 1
    );
  END LOOP;

  --------------------------------------------------------------------------
  -- ROUND 2: 16 matches
  -- status = 'pending'
  -- position_x = 300, position_y = (i-1)*240, column_index=1, row_index=i-1
  --------------------------------------------------------------------------
  FOR i IN 1..16 LOOP
    INSERT INTO matches (
      tournament_id, round_id, round_number, match_number,
      player1_id, player2_id, winner_id,
      status, match_type,
      redirect_url
    ) VALUES (
      v_tid, v_rid2, 2, i,
      NULL, NULL, NULL,
      'pending', 'regular',
      'https://vnrvjiet.acm.org'
    ) RETURNING id INTO v_mid;

    v_r2 := array_append(v_r2, v_mid);

    -- round 2: position_x=300, position_y=(i-1)*240  [120 * 2^1 = 240]
    v_px := 300;
    v_py := (i - 1) * 240;

    INSERT INTO bracket_positions (
      tournament_id, match_id, round_number,
      position_x, position_y, column_index, row_index
    ) VALUES (
      v_tid, v_mid, 2,
      v_px, v_py, 1, i - 1
    );
  END LOOP;

  --------------------------------------------------------------------------
  -- ROUND 3: 8 matches
  -- position_x = 600, position_y = (i-1)*480, column_index=2, row_index=i-1
  --------------------------------------------------------------------------
  FOR i IN 1..8 LOOP
    INSERT INTO matches (
      tournament_id, round_id, round_number, match_number,
      player1_id, player2_id, winner_id,
      status, match_type,
      redirect_url
    ) VALUES (
      v_tid, v_rid3, 3, i,
      NULL, NULL, NULL,
      'pending', 'regular',
      'https://vnrvjiet.acm.org'
    ) RETURNING id INTO v_mid;

    v_r3 := array_append(v_r3, v_mid);

    -- round 3: position_x=600, position_y=(i-1)*480  [120 * 2^2 = 480]
    v_px := 600;
    v_py := (i - 1) * 480;

    INSERT INTO bracket_positions (
      tournament_id, match_id, round_number,
      position_x, position_y, column_index, row_index
    ) VALUES (
      v_tid, v_mid, 3,
      v_px, v_py, 2, i - 1
    );
  END LOOP;

  --------------------------------------------------------------------------
  -- ROUND 4: 4 matches (Quarter Finals)
  -- position_x = 900, position_y = (i-1)*960, column_index=3, row_index=i-1
  --------------------------------------------------------------------------
  FOR i IN 1..4 LOOP
    INSERT INTO matches (
      tournament_id, round_id, round_number, match_number,
      player1_id, player2_id, winner_id,
      status, match_type,
      redirect_url
    ) VALUES (
      v_tid, v_rid4, 4, i,
      NULL, NULL, NULL,
      'pending', 'regular',
      'https://vnrvjiet.acm.org'
    ) RETURNING id INTO v_mid;

    v_r4 := array_append(v_r4, v_mid);

    -- round 4: position_x=900, position_y=(i-1)*960  [120 * 2^3 = 960]
    v_px := 900;
    v_py := (i - 1) * 960;

    INSERT INTO bracket_positions (
      tournament_id, match_id, round_number,
      position_x, position_y, column_index, row_index
    ) VALUES (
      v_tid, v_mid, 4,
      v_px, v_py, 3, i - 1
    );
  END LOOP;

  --------------------------------------------------------------------------
  -- ROUND 5: 2 matches (Semi Finals)
  -- position_x = 1200, position_y = (i-1)*1920, column_index=4, row_index=i-1
  --------------------------------------------------------------------------
  FOR i IN 1..2 LOOP
    INSERT INTO matches (
      tournament_id, round_id, round_number, match_number,
      player1_id, player2_id, winner_id,
      status, match_type,
      redirect_url
    ) VALUES (
      v_tid, v_rid5, 5, i,
      NULL, NULL, NULL,
      'pending', 'regular',
      'https://vnrvjiet.acm.org'
    ) RETURNING id INTO v_mid;

    v_r5 := array_append(v_r5, v_mid);

    -- round 5: position_x=1200, position_y=(i-1)*3840  [120 * 2^4 = 1920]
    v_px := 1200;
    v_py := (i - 1) * 1920;

    INSERT INTO bracket_positions (
      tournament_id, match_id, round_number,
      position_x, position_y, column_index, row_index
    ) VALUES (
      v_tid, v_mid, 5,
      v_px, v_py, 4, i - 1
    );
  END LOOP;

  --------------------------------------------------------------------------
  -- ROUND 6: 1 match (Final)
  -- position_x = 1500, position_y = 0, column_index=5, row_index=0
  --------------------------------------------------------------------------
  INSERT INTO matches (
    tournament_id, round_id, round_number, match_number,
    player1_id, player2_id, winner_id,
    status, match_type,
    redirect_url
  ) VALUES (
    v_tid, v_rid6, 6, 1,
    NULL, NULL, NULL,
    'pending', 'regular',
    'https://vnrvjiet.acm.org'
  ) RETURNING id INTO v_mid;

  v_r6 := array_append(v_r6, v_mid);

  -- round 6: position_x=1500, position_y=0  [row 0]
  INSERT INTO bracket_positions (
    tournament_id, match_id, round_number,
    position_x, position_y, column_index, row_index
  ) VALUES (
    v_tid, v_mid, 6,
    1500, 0, 5, 0
  );

  --------------------------------------------------------------------------
  -- STEP 3: Wire next_match_id
  --
  -- Rule (from advanced_bracket_functions.sql line 108):
  --   v_match_id := v_current_round_matches[(i + 1) / 2]
  -- i.e. previous-round match i feeds into current-round match CEIL(i/2)
  -- PostgreSQL integer division: (i+1)/2 gives:
  --   i=1 → 1, i=2 → 1, i=3 → 2, i=4 → 2 ... i=31→16, i=32→16
  --------------------------------------------------------------------------

  -- R1 → R2
  FOR i IN 1..array_length(v_r1, 1) LOOP
    UPDATE matches SET next_match_id = v_r2[(i + 1) / 2]
    WHERE id = v_r1[i];
  END LOOP;

  -- R2 → R3
  FOR i IN 1..array_length(v_r2, 1) LOOP
    UPDATE matches SET next_match_id = v_r3[(i + 1) / 2]
    WHERE id = v_r2[i];
  END LOOP;

  -- R3 → R4
  FOR i IN 1..array_length(v_r3, 1) LOOP
    UPDATE matches SET next_match_id = v_r4[(i + 1) / 2]
    WHERE id = v_r3[i];
  END LOOP;

  -- R4 → R5
  FOR i IN 1..array_length(v_r4, 1) LOOP
    UPDATE matches SET next_match_id = v_r5[(i + 1) / 2]
    WHERE id = v_r4[i];
  END LOOP;

  -- R5 → R6
  FOR i IN 1..array_length(v_r5, 1) LOOP
    UPDATE matches SET next_match_id = v_r6[(i + 1) / 2]
    WHERE id = v_r5[i];
  END LOOP;

  -- Round 6 (Final) has no next_match_id — already NULL by default

  --------------------------------------------------------------------------
  -- STEP 4: Reset round statuses to match an empty bracket
  -- Round 1 = 'active', rounds 2-6 = 'pending'
  -- Also reset completed_matches to 0
  --------------------------------------------------------------------------
  UPDATE rounds
  SET status = 'active', completed_matches = 0
  WHERE tournament_id = v_tid AND round_number = 1;

  UPDATE rounds
  SET status = 'pending', completed_matches = 0
  WHERE tournament_id = v_tid AND round_number > 1;

  RAISE NOTICE 'Done. Inserted % R1, % R2, % R3, % R4, % R5, % R6 matches.',
    array_length(v_r1,1), array_length(v_r2,1), array_length(v_r3,1),
    array_length(v_r4,1), array_length(v_r5,1), array_length(v_r6,1);

END $$;

-- ============================================================================
-- STEP 5: Verify
-- ============================================================================
DO $$
DECLARE
  v_tid       UUID := 'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID;
  v_matches   INTEGER;
  v_positions INTEGER;
  v_linked    INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_matches   FROM matches           WHERE tournament_id = v_tid;
  SELECT COUNT(*) INTO v_positions FROM bracket_positions WHERE tournament_id = v_tid;
  SELECT COUNT(*) INTO v_linked    FROM matches           WHERE tournament_id = v_tid AND round_number < 6 AND next_match_id IS NOT NULL;

  IF v_matches <> 63 THEN
    RAISE EXCEPTION 'VERIFICATION FAILED: expected 63 matches, got %', v_matches;
  END IF;
  IF v_positions <> 63 THEN
    RAISE EXCEPTION 'VERIFICATION FAILED: expected 63 bracket_positions, got %', v_positions;
  END IF;
  IF v_linked <> 62 THEN
    RAISE EXCEPTION 'VERIFICATION FAILED: expected 62 next_match_id links (all except Final), got %', v_linked;
  END IF;

  RAISE NOTICE '✅ VERIFICATION PASSED: % matches, % bracket_positions, % next_match_id links.',
    v_matches, v_positions, v_linked;
END $$;

-- Quick count check per round (for visual confirmation in Supabase output)
SELECT
  m.round_number,
  r.round_name,
  COUNT(m.id)            AS match_count,
  COUNT(m.next_match_id) AS linked_count
FROM matches m
JOIN rounds r ON m.round_id = r.id
WHERE m.tournament_id = 'd6c14a2b-4b7b-4f7e-9b3d-3c2e9b9f1234'::UUID
GROUP BY m.round_number, r.round_name
ORDER BY m.round_number;

COMMIT;
