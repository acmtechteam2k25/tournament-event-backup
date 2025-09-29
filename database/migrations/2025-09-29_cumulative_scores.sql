-- Cumulative scores support: columns, views, triggers, and RPCs

-- 1) Add total_points to participants (if not present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='participants' AND column_name='total_points'
  ) THEN
    ALTER TABLE participants ADD COLUMN total_points INTEGER DEFAULT 0;
  END IF;
END $$;

-- 2) Round-wise aggregate view
CREATE OR REPLACE VIEW participant_round_scores AS
SELECT 
  s.tournament_id,
  s.player_id,
  p.name AS player_name,
  p.roll_number,
  s.round_number,
  SUM(s.score) AS round_points,
  COUNT(*) AS matches_played,
  MAX(s.is_winner::int) AS any_win
FROM scores s
JOIN participants p ON p.id = s.player_id
GROUP BY s.tournament_id, s.player_id, p.name, p.roll_number, s.round_number;

-- 3) Tournament cumulative view
CREATE OR REPLACE VIEW participant_cumulative_scores AS
SELECT 
  s.tournament_id,
  s.player_id,
  p.name AS player_name,
  p.roll_number,
  SUM(s.score) AS total_points,
  SUM(s.is_winner::int) AS wins,
  COUNT(*) FILTER (WHERE s.is_winner = FALSE) AS losses
FROM scores s
JOIN participants p ON p.id = s.player_id
GROUP BY s.tournament_id, s.player_id, p.name, p.roll_number;

-- 4) Trigger function to keep participants.total_points in sync
CREATE OR REPLACE FUNCTION trg_refresh_participant_points()
RETURNS TRIGGER AS $$
DECLARE
  v_player_id UUID;
  v_tournament_id UUID;
  v_total INTEGER;
BEGIN
  v_player_id := COALESCE(NEW.player_id, OLD.player_id);
  v_tournament_id := COALESCE(NEW.tournament_id, OLD.tournament_id);

  SELECT COALESCE(SUM(score), 0)
  INTO v_total
  FROM scores
  WHERE player_id = v_player_id
    AND tournament_id = v_tournament_id;

  UPDATE participants
  SET total_points = v_total
  WHERE id = v_player_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_scores_refresh_participant_points_ins ON scores;
DROP TRIGGER IF EXISTS trg_scores_refresh_participant_points_upd ON scores;
DROP TRIGGER IF EXISTS trg_scores_refresh_participant_points_del ON scores;

CREATE TRIGGER trg_scores_refresh_participant_points_ins
AFTER INSERT ON scores
FOR EACH ROW EXECUTE FUNCTION trg_refresh_participant_points();

CREATE TRIGGER trg_scores_refresh_participant_points_upd
AFTER UPDATE ON scores
FOR EACH ROW EXECUTE FUNCTION trg_refresh_participant_points();

CREATE TRIGGER trg_scores_refresh_participant_points_del
AFTER DELETE ON scores
FOR EACH ROW EXECUTE FUNCTION trg_refresh_participant_points();

-- 5) RPC to fetch cumulative + round-wise in one call
CREATE OR REPLACE FUNCTION get_tournament_cumulative_scores(p_tournament_id UUID)
RETURNS TABLE (
  player_id UUID,
  player_name TEXT,
  roll_number TEXT,
  total_points INTEGER,
  wins INTEGER,
  losses INTEGER,
  round_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pcs.player_id,
    pcs.player_name,
    pcs.roll_number,
    pcs.total_points,
    pcs.wins,
    pcs.losses,
    COALESCE(
      (
        SELECT jsonb_agg(jsonb_build_object(
          'round_number', prs.round_number,
          'round_points', prs.round_points,
          'matches_played', prs.matches_played
        ) ORDER BY prs.round_number)
        FROM participant_round_scores prs
        WHERE prs.tournament_id = pcs.tournament_id
          AND prs.player_id = pcs.player_id
      ), '[]'::jsonb
    ) AS round_breakdown
  FROM participant_cumulative_scores pcs
  WHERE pcs.tournament_id = p_tournament_id
  ORDER BY pcs.total_points DESC, pcs.wins DESC, pcs.player_name ASC;
END;
$$ LANGUAGE plpgsql STABLE;


