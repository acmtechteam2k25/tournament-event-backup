-- Debug query to check match connections and winners
-- Run this after completing a Round 1 match to see what's happening

-- Check Round 1 matches and their next_match_id connections
SELECT 
    'Round 1 Matches' as section,
    m.id as match_id,
    m.match_number,
    m.status,
    p1.name as player1,
    p2.name as player2,
    w.name as winner,
    m.next_match_id,
    r.round_name
FROM matches m
LEFT JOIN participants p1 ON m.player1_id = p1.id
LEFT JOIN participants p2 ON m.player2_id = p2.id
LEFT JOIN participants w ON m.winner_id = w.id
LEFT JOIN rounds r ON m.round_id = r.id
WHERE m.round_number = 1
ORDER BY m.match_number;

-- Check Round 2 matches to see if winners have been advanced
SELECT 
    'Round 2 Matches' as section,
    m.id as match_id,
    m.match_number,
    m.status,
    p1.name as player1,
    p2.name as player2,
    w.name as winner,
    r.round_name
FROM matches m
LEFT JOIN participants p1 ON m.player1_id = p1.id
LEFT JOIN participants p2 ON m.player2_id = p2.id
LEFT JOIN participants w ON m.winner_id = w.id
LEFT JOIN rounds r ON m.round_id = r.id
WHERE m.round_number = 2
ORDER BY m.match_number;

-- Check if next_match_id connections exist
SELECT 
    'Next Match Connections' as section,
    r1.match_number as r1_match,
    r1.next_match_id,
    r2.match_number as r2_match,
    r1w.name as r1_winner,
    r2p1.name as r2_player1,
    r2p2.name as r2_player2
FROM matches r1
LEFT JOIN matches r2 ON r1.next_match_id = r2.id
LEFT JOIN participants r1w ON r1.winner_id = r1w.id
LEFT JOIN participants r2p1 ON r2.player1_id = r2p1.id
LEFT JOIN participants r2p2 ON r2.player2_id = r2p2.id
WHERE r1.round_number = 1
ORDER BY r1.match_number;