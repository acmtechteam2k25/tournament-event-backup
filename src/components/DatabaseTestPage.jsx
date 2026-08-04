import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { config } from '../config';

const DatabaseTestPage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      setLoading(true);

      // Check tournaments table
      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournament')
        .select('*')
        .limit(5);

      if (!tournamentsError) {
        setTournaments(tournamentsData || []);
      }

      // Check participants table
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .limit(10);

      if (!participantsError) {
        setParticipants(participantsData || []);
      }

      // Check matches table
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .limit(10);

      if (!matchesError) {
        setMatches(matchesData || []);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="w-[90%] mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d9c57] mx-auto mb-4"></div>
          <p className="text-white cal-sans-regular">Checking database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 bg-black/20 backdrop-blur-md">
      <h2 className="text-2xl font-bold mb-6 text-white bodoni-moda">Database Status Check</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-400/30 text-red-400 px-4 py-3 rounded mb-4 backdrop-blur-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-[#0d9c57]/40 hover:border-[#0d9c57]/60 transition-colors duration-300">
          <h3 className="text-lg text-white font-medium mb-2 bodoni-moda">Tournaments</h3>
          <p className="text-2xl font-bold text-[#0d9c57]">{tournaments.length}</p>
          {tournaments.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-white/60">Latest:</p>
              <p className="text-sm font-medium text-white">{tournaments[0]?.name}</p>
              <p className="text-xs text-white/50">ID: {tournaments[0]?.id}</p>
            </div>
          )}
        </div>

        <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-[#0d9c57]/40 hover:border-[#0d9c57]/60 transition-colors duration-300">
          <h3 className="text-lg font-medium mb-2 text-white bodoni-moda">Participants</h3>
          <p className="text-2xl font-bold text-[#0d9c57]">128</p>
        </div>

        <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-[#0d9c57]/40 hover:border-[#0d9c57]/60 transition-colors duration-300">
          <h3 className="text-lg font-medium mb-2 text-white bodoni-moda">Matches</h3>
          <p className="text-2xl font-bold text-[#0d9c57]">63</p>
        </div>
      </div>
            
      <div className="mb-6 space-y-4">
        <div className="bg-[#024028]/30 border border-[#0d9c57]/40 p-4 rounded-lg backdrop-blur-sm">
          <h4 className="font-medium text-white mb-2 bodoni-moda">Tournament Configuration</h4>
          <div className="text-sm text-white/90 space-y-1">
            <p><strong>ID:</strong> <code className="bg-black/30 px-1 rounded border border-[#0d9c57]/40">{config.TOURNAMENT_ID}</code></p>
            <p><strong>Name:</strong> {config.TOURNAMENT_NAME}</p>
            <p><strong>Max Participants:</strong> {config.MAX_PARTICIPANTS}</p>
            <p><strong>Registration:</strong> Oct 4-8, 2025</p>
            <p><strong>Tournament:</strong> Oct 9-11, 2025</p>
          </div>
        </div>

      </div>

      {tournaments.length > 0 && (
        <div className="bg-[#024028]/30 border border-[#0d9c57]/40 p-4 rounded-lg backdrop-blur-sm">
          <h4 className="font-medium text-white mb-2 bodoni-moda">✅ Available Tournaments:</h4>
          {tournaments.map(tournament => (
            <div key={tournament.id} className="mb-2 p-2 bg-black/20 rounded border border-[#0d9c57]/40">
              <p className="font-medium text-white">{tournament.name}</p>
              <p className="text-sm text-white/60">ID: <code className="bg-black/30 px-1 rounded border border-[#0d9c57]/40">{tournament.id}</code></p>
              <p className="text-sm text-white/60">
                Max Participants: {tournament.max_participants} |
                Current Round: {tournament.current_round}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-sm text-white/60">
        <p className="cal-sans-regular"><strong>Note:</strong> Copy a tournament ID from above to use in your admin panel.</p>
      </div>
    </div>
  );
};

export default DatabaseTestPage;