import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Environment variables validation
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configuration is incomplete.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database function helpers
export const tournamentAPI = {
  // Update match winner (basic version)
  updateMatchWinner: async (matchId, winnerId, winnerScore = 0, loserScore = 0, isWalkover = false) => {
    const { data, error } = await supabase.rpc('update_match_winner', {
      p_match_id: matchId,
      p_winner_id: winnerId,
      p_winner_score: winnerScore,
      p_loser_score: loserScore,
      p_is_walkover: isWalkover
    });
    
    if (error) throw error;
    return data;
  },

  // Get tournament bracket
  getTournamentBracket: async (tournamentId) => {
    const { data, error } = await supabase.rpc('get_tournament_bracket', {
      p_tournament_id: tournamentId
    })
    
    if (error) throw error
    return data
  },

  // Get participants
  getParticipants: async (tournamentId) => {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('seed_number')
    
    if (error) throw error
    return data
  },

  // Get the redirect_url for a specific match.
  // Returns the match's own redirect_url, or null if not set / not found.
  getMatchRedirectUrl: async (matchId) => {
    const { data, error } = await supabase
      .from('matches')
      .select('redirect_url')
      .eq('id', matchId)
      .single()

    if (error || !data) return null
    return data.redirect_url || null
  },

  // Get cumulative scores
  getCumulativeScores: async (tournamentId) => {
    // Get all participants
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('id, name, roll_number')
      .eq('tournament_id', tournamentId)
    
    if (participantsError) throw participantsError
    
    // Get all scores for this tournament
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('player_id, score, is_winner')
      .eq('tournament_id', tournamentId)
    
    if (scoresError) throw scoresError
    
    // Calculate cumulative stats for each participant
    const cumulativeData = participants.map(participant => {
      // Get all scores for this participant
      const playerScores = scores.filter(s => s.player_id === participant.id)
      
      // Calculate total points (sum of all scores)
      const totalPoints = playerScores.reduce((sum, s) => sum + (s.score || 0), 0)
      
      // Calculate wins (count where is_winner = true)
      const wins = playerScores.filter(s => s.is_winner === true).length
      
      // Calculate losses (count where is_winner = false)
      const losses = playerScores.filter(s => s.is_winner === false).length
      
      return {
        player_id: participant.id,
        player_name: participant.name,
        roll_number: participant.roll_number,
        total_points: totalPoints,
        wins: wins,
        losses: losses
      }
    })
    
    // Sort by total points (descending), then by wins
    return cumulativeData.sort((a, b) => {
      if (b.total_points !== a.total_points) {
        return b.total_points - a.total_points
      }
      return b.wins - a.wins
    })
  }
}
