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
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Checking database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6">Database Status Check</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Tournaments</h3>
          <p className="text-2xl font-bold text-blue-600">{tournaments.length}</p>
          {tournaments.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Latest:</p>
              <p className="text-sm font-medium">{tournaments[0]?.name}</p>
              <p className="text-xs text-gray-500">ID: {tournaments[0]?.id}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Participants</h3>
          <p className="text-2xl font-bold text-green-600">{participants.length}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Matches</h3>
          <p className="text-2xl font-bold text-purple-600">{matches.length}</p>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Tournament 2k25 Configuration</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>ID:</strong> {config.TOURNAMENT_ID}</p>
            <p><strong>Name:</strong> {config.TOURNAMENT_NAME}</p>
            <p><strong>Max Participants:</strong> {config.MAX_PARTICIPANTS}</p>
            <p><strong>Registration:</strong> Oct 4-8, 2025</p>
            <p><strong>Tournament:</strong> Oct 9-11, 2025</p>
          </div>
        </div>

      </div>

      {tournaments.length > 0 && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">✅ Available Tournaments:</h4>
          {tournaments.map(tournament => (
            <div key={tournament.id} className="mb-2 p-2 bg-white rounded border">
              <p className="font-medium">{tournament.name}</p>
              <p className="text-sm text-gray-600">ID: {tournament.id}</p>
              <p className="text-sm text-gray-600">
                Max Participants: {tournament.max_participants} | 
                Current Round: {tournament.current_round}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Note:</strong> Copy a tournament ID from above to use in your admin panel.</p>
      </div>
    </div>
  );
};

export default DatabaseTestPage;