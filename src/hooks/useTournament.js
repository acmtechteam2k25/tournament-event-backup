import { useState, useEffect } from 'react'
import { tournamentAPI } from '../lib/supabase'
import config from '../config'

export const useTournament = (tournamentId) => {
  const [bracket, setBracket] = useState([])
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBracket = async () => {
    try {
      setLoading(true)
      
      // Check if we should use database or fall back to local mode
      if (!config.USE_DATABASE || !config.checkEnvironment()) {
        setBracket([])
        setLoading(false)
        return
      }
      
      const data = await tournamentAPI.getTournamentBracket(tournamentId)
      setBracket(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchParticipants = async () => {
    try {
      // Check if we should use database or fall back to local mode
      if (!config.USE_DATABASE || !config.checkEnvironment()) {
        setParticipants([])
        return
      }
      
      const data = await tournamentAPI.getParticipants(tournamentId)
      setParticipants(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const updateMatchWinner = async (matchId, winnerId, winnerScore = 0, loserScore = 0, isWalkover = false) => {
    try {
      const result = await tournamentAPI.updateMatchWinnerAdvanced(matchId, winnerId, winnerScore, loserScore, isWalkover);
      
      // Refresh bracket after update
      await fetchBracket();
      await fetchParticipants();
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  const createCompleteBracket = async (participantIds) => {
    try {
      const result = await tournamentAPI.createCompleteTournamentBracket(tournamentId, participantIds);
      
      // Refresh bracket after creation
      await fetchBracket();
      await fetchParticipants();
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  const getTournamentStatus = async () => {
    try {
      return await tournamentAPI.getTournamentStatus(tournamentId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  useEffect(() => {
    if (tournamentId) {
      fetchBracket()
      fetchParticipants()
    } else {
      setLoading(false)
    }
  }, [tournamentId])

  return {
    bracket,
    participants,
    loading,
    error,
    updateMatchWinner,
    createCompleteBracket,
    getTournamentStatus,
    refreshBracket: fetchBracket
  }
}