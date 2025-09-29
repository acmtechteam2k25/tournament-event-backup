import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { config } from '../config';

const TournamentInitializer = ({ onTournamentCreated }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Give participants simple 1-64 seed numbers based on their order
  // The bracket positions will handle the tournament seeding logic

  // Load existing participants from database
  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('tournament_id', config.TOURNAMENT_ID)
        .order('seed_number');

      if (error) throw error;
      setParticipants(data || []);
    } catch (err) {
      // Silently handle error
    }
  };

  // Removed sample participants generator to avoid mock data in production

  const importFromCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n').filter(line => line.trim());
        
        if (lines.length < 65) {
          setError('CSV must contain exactly 64 participants');
          return;
        }

        const imported = [];
        // Skip header row
        for (let i = 1; i <= 64; i++) {
          const line = lines[i]?.trim();
          if (!line) continue;

          const [name, roll_number, email] = line.split(',').map(field => field.trim().replace(/"/g, ''));
          if (name && roll_number && email) {
            imported.push({
              name,
              roll_number,
              email,
              seed_number: i // Simple 1-64 seeding based on CSV order
            });
          }
        }

        if (imported.length !== 64) {
          setError('CSV must contain exactly 64 valid participants');
          return;
        }

        setParticipants(imported);
        setError('');
      } catch (err) {
        setError('Error reading CSV file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const createRound1Matches = async (insertedParticipants) => {
    try {
      // Get round 1 ID
      const { data: round1 } = await supabase
        .from('rounds')
        .select('id')
        .eq('tournament_id', config.TOURNAMENT_ID)
        .eq('round_number', 1)
        .single();

      if (!round1) {
        throw new Error('Round 1 not found');
      }

      // Tournament bracket seeding: 1v64, 2v63, 3v62, etc. then 16v49, 17v48, etc.
      const BRACKET_SEEDING = [
        1, 64, 32, 33, 16, 49, 17, 48, 8, 57, 25, 40, 9, 56, 24, 41,
        4, 61, 29, 36, 13, 52, 20, 45, 5, 60, 28, 37, 12, 53, 21, 44,
        2, 63, 31, 34, 15, 50, 18, 47, 7, 58, 26, 39, 10, 55, 23, 42,
        3, 62, 30, 35, 14, 51, 19, 46, 6, 59, 27, 38, 11, 54, 22, 43
      ];

      // Sort participants by seed number
      const sortedParticipants = insertedParticipants.sort((a, b) => a.seed_number - b.seed_number);

      // Create 32 matches for Round 1 with proper tournament bracket seeding
      const matchesData = [];
      const bracketPositionsData = [];
      
      for (let i = 0; i < 32; i++) {
        // Get seeds from bracket seeding order
        const seed1 = BRACKET_SEEDING[i * 2];
        const seed2 = BRACKET_SEEDING[i * 2 + 1];
        
        // Find participants with these seeds
        const player1 = sortedParticipants.find(p => p.seed_number === seed1);
        const player2 = sortedParticipants.find(p => p.seed_number === seed2);
        
        matchesData.push({
          tournament_id: config.TOURNAMENT_ID,
          round_id: round1.id,
          round_number: 1,
          match_number: i + 1,
          player1_id: player1.id,
          player2_id: player2.id,
          status: 'scheduled',
          match_type: 'regular'
        });

        // Create bracket position for this match (Round 1 positioning)
        bracketPositionsData.push({
          tournament_id: config.TOURNAMENT_ID,
          round_number: 1,
          position_x: 50, // Left side of bracket
          position_y: 50 + (i * 120), // Vertical spacing
          column_index: 0,
          row_index: i
        });
      }

      // Insert matches first
      const { data: insertedMatches, error: matchesError } = await supabase
        .from('matches')
        .insert(matchesData)
        .select('id');

      if (matchesError) throw matchesError;

      // Add match IDs to bracket positions
      const bracketPositionsWithMatches = bracketPositionsData.map((pos, index) => ({
        ...pos,
        match_id: insertedMatches[index].id
      }));

      // Insert bracket positions
      const { error: positionsError } = await supabase
        .from('bracket_positions')
        .insert(bracketPositionsWithMatches);

      if (positionsError) {
        // Silently handle bracket positions error
      }

    } catch (error) {
      throw error;
    }
  };

  const initializeTournament = async () => {
    if (participants.length !== 64) {
      setError('Exactly 64 participants required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Clear existing data (in proper order due to foreign key constraints)
      await supabase.from('bracket_positions').delete().eq('tournament_id', config.TOURNAMENT_ID);
      await supabase.from('scores').delete().eq('tournament_id', config.TOURNAMENT_ID);
      await supabase.from('matches').delete().eq('tournament_id', config.TOURNAMENT_ID);
      await supabase.from('rounds').delete().eq('tournament_id', config.TOURNAMENT_ID);
      await supabase.from('participants').delete().eq('tournament_id', config.TOURNAMENT_ID);

      // Insert participants with proper seeding
      const participantsData = participants.map(participant => ({
        tournament_id: config.TOURNAMENT_ID,
        name: participant.name,
        roll_number: participant.roll_number,
        email: participant.email,
        seed_number: participant.seed_number,
        status: 'active',
        current_round: 1,
        total_wins: 0
      }));

      const { data: insertedParticipants, error: participantsError } = await supabase
        .from('participants')
        .insert(participantsData)
        .select('id, seed_number');

      if (participantsError) throw participantsError;

      // Sort participants by seed number and create the complete tournament bracket
      const sortedParticipants = insertedParticipants.sort((a, b) => a.seed_number - b.seed_number);
      const participantIds = sortedParticipants.map(p => p.id);

      // Create complete tournament bracket with all rounds using the advanced function
      const { data, error } = await supabase.rpc('create_complete_tournament_bracket', {
        p_tournament_id: config.TOURNAMENT_ID,
        p_participant_ids: participantIds
      });

      if (error) throw error;
      
      // Reload participants from database
      await loadParticipants();

      if (onTournamentCreated) {
        onTournamentCreated({ id: config.TOURNAMENT_ID, name: config.TOURNAMENT_NAME });
      }

      alert('Tournament initialized successfully!');
    } catch (error) {
      setError('Failed to initialize tournament: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setParticipants([]);
    setError('');
  };

  return (
    <div className="tournament-initializer p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Tournament 2k25 Setup</h2>
      
      {/* Info Banner */}
      <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-3 rounded mb-6">
        <h3 className="font-medium mb-2">Tournament Requirements</h3>
        <ul className="text-sm space-y-1">
          <li>• Exactly <strong>64 participants</strong> required</li>
          <li>• CSV format: <code>name,roll_number,email</code></li>
          <li>• Seeding calculated automatically using tournament bracket order</li>
          <li>• Creates 32 Round 1 matches automatically</li>
        </ul>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-4">
        <label className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer transition-colors duration-200">
          Import 64 Participants from CSV
          <input
            type="file"
            accept=".csv"
            onChange={importFromCSV}
            className="hidden"
          />
        </label>
        
        <button
          onClick={clearAll}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors duration-200"
        >
          Clear All
        </button>
      </div>

      {/* Participants Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Participants ({participants.length}/64)
        </h3>
        
        {participants.length === 0 ? (
          <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
            No participants added yet. Please upload a CSV file with 64 participants.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Seed</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Roll Number</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                </tr>
              </thead>
              <tbody>
                {participants
                  .sort((a, b) => a.seed_number - b.seed_number)
                  .map((participant, index) => (
                  <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-blue-600">
                      {participant.seed_number}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{participant.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{participant.roll_number}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{participant.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Initialize Tournament Button */}
      <div className="text-center">
        <button
          onClick={initializeTournament}
          disabled={participants.length !== 64 || loading}
          className={`px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 ${
            participants.length === 64 && !loading
              ? 'bg-purple-600 hover:bg-purple-700 transform hover:scale-105'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? 'Initializing...' : 'Initialize Tournament 2k25'}
        </button>
        
        <div className="mt-4">
          <p className={`text-sm font-medium ${
            participants.length === 64 ? 'text-green-600' : 'text-gray-500'
          }`}>
            Current: {participants.length}/64 participants
          </p>
          {participants.length === 64 && (
            <p className="text-xs text-green-600 flex items-center justify-center mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Ready to initialize tournament!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentInitializer;