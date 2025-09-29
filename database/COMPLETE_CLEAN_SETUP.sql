-- COMPLETE CLEAN DATABASE SETUP
-- Run this entire script in Supabase SQL Editor to start fresh
-- Based on the exact schema from schema.sql

-- Step 1: Drop all existing tables and functions (clean slate)
DROP FUNCTION IF EXISTS update_match_winner(UUID, UUID, INTEGER, INTEGER, BOOLEAN);
DROP FUNCTION IF EXISTS get_tournament_bracket(UUID);
DROP FUNCTION IF EXISTS initialize_tournament_bracket(UUID, UUID[]);
DROP FUNCTION IF EXISTS get_participant_scores(UUID);

DROP TABLE IF EXISTS bracket_positions CASCADE;
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS rounds CASCADE;
DROP TABLE IF EXISTS tournament CASCADE;

-- =====================================
-- TOURNAMENT TABLE (Main Event Details)
-- =====================================
CREATE TABLE tournament (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT 'ACM Tournament',
  description TEXT,
  max_participants INTEGER DEFAULT 64,
  current_round INTEGER DEFAULT 1,
  num_rounds INTEGER DEFAULT 6,
  registration_start TIMESTAMP WITH TIME ZONE,
  registration_end TIMESTAMP WITH TIME ZONE,
  tournament_start TIMESTAMP WITH TIME ZONE,
  tournament_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- PARTICIPANTS TABLE
-- =====================================
CREATE TABLE participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournament(id) ON DELETE CASCADE,
  roll_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  seed_number INTEGER,
  status VARCHAR(20) DEFAULT 'active', -- active, eliminated
  current_round INTEGER DEFAULT 1,
  total_wins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(tournament_id, seed_number)
);

-- =====================================
-- ROUNDS TABLE
-- =====================================
CREATE TABLE rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournament(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  round_name VARCHAR(100) NOT NULL, -- 'Round 1', 'Quarter Final', 'Semi Final', 'Final'
  max_participants INTEGER NOT NULL,
  total_matches INTEGER NOT NULL,
  completed_matches INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(tournament_id, round_number)
);

-- =====================================
-- MATCHES TABLE
-- =====================================
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournament(id) ON DELETE CASCADE,
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  next_match_id UUID REFERENCES matches(id), -- Winner advances to this match
  player1_id UUID REFERENCES participants(id),
  player2_id UUID REFERENCES participants(id),
  winner_id UUID REFERENCES participants(id),
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed
  match_type VARCHAR(20) DEFAULT 'regular', -- regular, walkover, bye
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(tournament_id, round_number, match_number),
  CONSTRAINT valid_players CHECK (player1_id != player2_id)
);

-- =====================================
-- SCORES TABLE
-- Each participant gets their own score record for each match they play
-- This allows tracking individual performance throughout the tournament
-- =====================================
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournament(id) ON DELETE CASCADE,
  player_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  score INTEGER DEFAULT 0, -- Individual player's score for this match
  is_winner BOOLEAN DEFAULT FALSE,
  result_type VARCHAR(20) DEFAULT 'regular', -- regular, walkover, bye
  advancement_status VARCHAR(20) DEFAULT 'pending', -- advanced, eliminated, pending
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(player_id, match_id)
);

-- =====================================
-- BRACKET_POSITIONS TABLE
-- =====================================
CREATE TABLE bracket_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournament(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  column_index INTEGER NOT NULL,
  row_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(match_id)
);

-- =====================================
-- PERFORMANCE INDEXES
-- =====================================
CREATE INDEX idx_participants_tournament_status ON participants(tournament_id, status);
CREATE INDEX idx_participants_roll ON participants(roll_number);
CREATE INDEX idx_matches_tournament_round ON matches(tournament_id, round_number, match_number);
CREATE INDEX idx_scores_player_match ON scores(player_id, match_id);
CREATE INDEX idx_bracket_positions_match ON bracket_positions(match_id);
CREATE INDEX idx_rounds_tournament ON rounds(tournament_id, round_number);

-- =====================================
-- ESSENTIAL FUNCTIONS
-- =====================================

-- Function to update match winner (Modified to return JSON for frontend compatibility)
CREATE OR REPLACE FUNCTION update_match_winner(
  p_match_id UUID,
  p_winner_id UUID,
  p_winner_score INTEGER DEFAULT 0,
  p_loser_score INTEGER DEFAULT 0,
  p_is_walkover BOOLEAN DEFAULT FALSE
) RETURNS JSON AS $$
DECLARE
  v_tournament_id UUID;
  v_next_match_id UUID;
  v_round_number INTEGER;
  v_round_id UUID;
  v_loser_id UUID;
  v_match_number INTEGER;
BEGIN
  -- Get match details
  SELECT tournament_id, next_match_id, round_number, round_id, match_number,
         CASE WHEN player1_id = p_winner_id THEN player2_id ELSE player1_id END
  INTO v_tournament_id, v_next_match_id, v_round_number, v_round_id, v_match_number, v_loser_id
  FROM matches WHERE id = p_match_id;
  
  -- Check if match was found
  IF v_tournament_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Match not found');
  END IF;
  
  -- Update match
  UPDATE matches 
  SET winner_id = p_winner_id, 
      status = 'completed',
      match_type = CASE WHEN p_is_walkover THEN 'walkover' ELSE 'regular' END
  WHERE id = p_match_id;
  
  -- Update participants
  UPDATE participants 
  SET current_round = CASE WHEN v_next_match_id IS NOT NULL THEN v_round_number + 1 ELSE v_round_number END,
      total_wins = total_wins + 1,
      status = CASE WHEN v_next_match_id IS NULL THEN 'champion' ELSE 'active' END
  WHERE id = p_winner_id;
  
  UPDATE participants 
  SET status = 'eliminated'
  WHERE id = v_loser_id;
  
  -- Insert scores (separate record for each participant)
  INSERT INTO scores (tournament_id, player_id, round_id, match_id, round_number, match_number, 
                     score, is_winner, result_type, advancement_status)
  VALUES 
    (v_tournament_id, p_winner_id, v_round_id, p_match_id, v_round_number, v_match_number,
     p_winner_score, TRUE, 
     CASE WHEN p_is_walkover THEN 'walkover' ELSE 'regular' END, 'advanced'),
    (v_tournament_id, v_loser_id, v_round_id, p_match_id, v_round_number, v_match_number,
     p_loser_score, FALSE, 
     CASE WHEN p_is_walkover THEN 'walkover' ELSE 'regular' END, 'eliminated');
  
  -- Advance winner to next match
  IF v_next_match_id IS NOT NULL THEN
    UPDATE matches 
    SET player1_id = CASE WHEN player1_id IS NULL THEN p_winner_id ELSE player1_id END,
        player2_id = CASE WHEN player1_id IS NOT NULL AND player2_id IS NULL THEN p_winner_id ELSE player2_id END
    WHERE id = v_next_match_id;
  END IF;
  
  -- Update round completion
  UPDATE rounds 
  SET completed_matches = completed_matches + 1,
      status = CASE WHEN completed_matches + 1 >= total_matches THEN 'completed' ELSE status END
  WHERE id = v_round_id;

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
$$ LANGUAGE plpgsql;

-- Function to get tournament bracket data (Modified to work with our schema)
CREATE OR REPLACE FUNCTION get_tournament_bracket(p_tournament_id UUID)
RETURNS TABLE (
  match_id UUID,
  round_number INTEGER,
  match_number INTEGER,
  status VARCHAR,
  player1 JSON,
  player2 JSON,
  winner_id UUID,
  match_position JSON,
  next_match_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as match_id,
    m.round_number,
    m.match_number,
    m.status,
    CASE WHEN p1.id IS NOT NULL THEN
      json_build_object(
        'id', p1.id,
        'name', p1.name,
        'roll_number', p1.roll_number,
        'seed_number', p1.seed_number,
        'status', p1.status
      )
    ELSE NULL END as player1,
    CASE WHEN p2.id IS NOT NULL THEN
      json_build_object(
        'id', p2.id,
        'name', p2.name,
        'roll_number', p2.roll_number,
        'seed_number', p2.seed_number,
        'status', p2.status
      )
    ELSE NULL END as player2,
    m.winner_id,
    CASE WHEN bp.id IS NOT NULL THEN
      json_build_object(
        'x', bp.position_x,
        'y', bp.position_y,
        'column_index', bp.column_index,
        'row_index', bp.row_index
      )
    ELSE NULL END as match_position,
    m.next_match_id
  FROM matches m
  LEFT JOIN participants p1 ON m.player1_id = p1.id
  LEFT JOIN participants p2 ON m.player2_id = p2.id
  LEFT JOIN bracket_positions bp ON m.id = bp.match_id
  WHERE m.tournament_id = p_tournament_id
  ORDER BY m.round_number, m.match_number;
END;
$$ LANGUAGE plpgsql;

-- Function to initialize tournament bracket
CREATE OR REPLACE FUNCTION initialize_tournament_bracket(
  p_tournament_id UUID,
  p_participants UUID[]
) RETURNS VOID AS $$
DECLARE
  v_participant_count INTEGER;
  v_round_1_matches INTEGER;
  v_current_match_id INTEGER := 1;
  v_participant_id UUID;
  v_match_id UUID;
  i INTEGER;
BEGIN
  v_participant_count := array_length(p_participants, 1);
  v_round_1_matches := v_participant_count / 2;
  
  -- Create Round 1
  INSERT INTO rounds (tournament_id, round_number, round_name, max_participants, total_matches)
  VALUES (p_tournament_id, 1, 'Round 1', v_participant_count, v_round_1_matches);
  
  -- Create Round 1 matches
  FOR i IN 1..v_round_1_matches LOOP
    INSERT INTO matches (tournament_id, round_id, round_number, match_number, 
                        player1_id, player2_id)
    VALUES (p_tournament_id, 
            (SELECT id FROM rounds WHERE tournament_id = p_tournament_id AND round_number = 1),
            1, i,
            p_participants[i*2-1], p_participants[i*2])
    RETURNING id INTO v_match_id;
    
    -- Add bracket positions (you can customize these based on your UI layout)
    INSERT INTO bracket_positions (tournament_id, match_id, round_number, position_x, position_y, column_index, row_index)
    VALUES (p_tournament_id, v_match_id, 1, 0, (i-1) * 120, 0, i-1);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert Tournament 2k25 record
INSERT INTO tournament (id, name, description, max_participants) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    'Tournament 2k25', 
    'Annual ACM Tournament 2025', 
    64
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    max_participants = EXCLUDED.max_participants;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;

-- Verification
SELECT 'SETUP COMPLETE!' as status;
SELECT 'Tournament created: ' || name as tournament_info FROM tournament WHERE id = '550e8400-e29b-41d4-a716-446655440000';
SELECT 'Functions created:' as functions_status;
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%match%';