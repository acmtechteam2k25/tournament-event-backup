-- COMPLETE CLEAN DATABASE SETUP
-- Run this entire script in Supabase SQL Editor to start fresh

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
  roll_number VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  seed_number INTEGER,
  status VARCHAR(20) DEFAULT 'active',
  current_round INTEGER DEFAULT 1,
  total_wins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, seed_number),
  UNIQUE(email)  -- One email per participant across all tournaments
);

-- =====================================
-- ROUNDS TABLE
-- =====================================
CREATE TABLE rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournament(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  round_name VARCHAR(100) NOT NULL,
  max_participants INTEGER NOT NULL,
  total_matches INTEGER NOT NULL,
  completed_matches INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
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
  next_match_id UUID REFERENCES matches(id),
  player1_id UUID REFERENCES participants(id),
  player2_id UUID REFERENCES participants(id),
  winner_id UUID REFERENCES participants(id),
  status VARCHAR(20) DEFAULT 'scheduled',
  match_type VARCHAR(20) DEFAULT 'regular',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, round_number, match_number),
  CONSTRAINT valid_players CHECK (player1_id != player2_id)
);

-- =====================================
-- SCORES TABLE
-- =====================================
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournament(id) ON DELETE CASCADE,
  player_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  is_winner BOOLEAN DEFAULT FALSE,
  result_type VARCHAR(20) DEFAULT 'regular',
  advancement_status VARCHAR(20) DEFAULT 'pending',
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

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;

-- Verification
SELECT 'SETUP COMPLETE!' as status;