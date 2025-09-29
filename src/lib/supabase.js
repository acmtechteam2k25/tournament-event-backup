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

  // Update match winner (advanced version with automatic round progression)
  updateMatchWinnerAdvanced: async (matchId, winnerId, winnerScore = 0, loserScore = 0, isWalkover = false) => {
    const { data, error } = await supabase.rpc('update_match_winner_advanced', {
      p_match_id: matchId,
      p_winner_id: winnerId,
      p_winner_score: winnerScore,
      p_loser_score: loserScore,
      p_is_walkover: isWalkover
    });
    
    if (error) throw error;
    return data;
  },

  // Create complete tournament bracket with all rounds
  createCompleteTournamentBracket: async (tournamentId, participantIds) => {
    const { data, error } = await supabase.rpc('create_complete_tournament_bracket', {
      p_tournament_id: tournamentId,
      p_participant_ids: participantIds
    });
    
    if (error) throw error;
    return data;
  },

  // Get tournament status and progression
  getTournamentStatus: async (tournamentId) => {
    const { data, error } = await supabase.rpc('get_tournament_status', {
      p_tournament_id: tournamentId
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

  // Get matches for a round
  getMatchesByRound: async (tournamentId, roundNumber) => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        player1:player1_id(*),
        player2:player2_id(*),
        winner:winner_id(*)
      `)
      .eq('tournament_id', tournamentId)
      .eq('round_number', roundNumber)
      .order('match_number')
    
    if (error) throw error
    return data
  },

  // Get scores for a participant
  getParticipantScores: async (participantId) => {
    const { data, error } = await supabase
      .from('scores')
      .select(`
        *,
        match:match_id(match_name, round_number),
        round:round_id(round_name)
      `)
      .eq('player_id', participantId)
      .order('round_number')
    
    if (error) throw error
    return data
  }
}