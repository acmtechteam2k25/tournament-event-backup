import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { config } from '../config';

const TournamentInitializer = ({ tournamentId: propTournamentId, onTournamentCreated }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const tournamentId = propTournamentId || config.TOURNAMENT_ID;

  // Give participants simple 1-64 seed numbers based on their order
  // The bracket positions will handle the tournament seeding logic

  // Load existing participants from database
  useEffect(() => {
    loadParticipants();
  }, [tournamentId]);

  const loadParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('seed_number');

      if (error) throw error;
      // ── DEBUG: log what loadParticipants received from Supabase ───────────
      console.log('[loadParticipants] tournament_id queried:', tournamentId);
      console.log('[loadParticipants] rows returned:', data?.length ?? 0, data);
      // ──────────────────────────────────────────────────────────────────────
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

        // Determine expected participant count based on selected tournament
        const tournamentsMap = config.TOURNAMENTS || {};
        const tournamentEntry = Object.values(tournamentsMap).find(t => t.id === tournamentId);
        const expectedCount = tournamentEntry?.maxParticipants || config.MAX_PARTICIPANTS || 64;

        if (lines.length < expectedCount + 1) {
          setError(`CSV must contain exactly ${expectedCount} participants`);
          return;
        }

        const imported = [];
        // Skip header row
        for (let i = 1; i <= expectedCount; i++) {
          const line = lines[i]?.trim();
          if (!line) continue;

          const parts = line.split(',').map(field => field.trim().replace(/"/g, ''));
          const [name, roll_number, email, mobile_number] = parts;
          if (name && roll_number && email) {
            const entry = {
              name,
              roll_number,
              email,
              seed_number: i // Simple seeding based on CSV order
            };
            // mobile_number is optional; include only when present and exactly 10 digits
            if (mobile_number && /^\d{10}$/.test(mobile_number.trim())) {
              entry.mobile_number = mobile_number.trim();
            }
            imported.push(entry);
          }
        }

        if (imported.length !== expectedCount) {
          setError(`CSV must contain exactly ${expectedCount} valid participants`);
          return;
        }

        // Restore duplicate validation: block duplicates by roll_number, email, or name
        const rollSet = new Set();
        const emailSet = new Set();
        const nameSet = new Set();
        for (const p of imported) {
          const r = p.roll_number.toLowerCase();
          const e = p.email.toLowerCase();
          const n = p.name.toLowerCase();
          if (rollSet.has(r)) {
            setError(`Duplicate roll number found: ${p.roll_number}`);
            return;
          }
          if (emailSet.has(e)) {
            setError(`Duplicate email found: ${p.email}`);
            return;
          }
          if (nameSet.has(n)) {
            setError(`Duplicate name found: ${p.name}`);
            return;
          }
          rollSet.add(r);
          emailSet.add(e);
          nameSet.add(n);
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
        .eq('tournament_id', tournamentId)
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
          tournament_id: tournamentId,
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
          tournament_id: tournamentId,
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
    const tournamentsMap = config.TOURNAMENTS || {};
    const tournamentEntry = Object.values(tournamentsMap).find(t => t.id === tournamentId);
    const expectedCount = tournamentEntry?.maxParticipants || config.MAX_PARTICIPANTS || 64;
    if (participants.length !== expectedCount) {
      setError(`Exactly ${expectedCount} participants required`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Ensure tournament exists to satisfy FK (temporary safeguard)
      const tournamentsMap = config.TOURNAMENTS || {};
      const tournamentEntry = Object.values(tournamentsMap).find(t => t.id === tournamentId);
      const tournamentName = tournamentEntry?.name || config.TOURNAMENT_NAME || 'ACM Tournament';
      await supabase
        .from('tournament')
        .upsert({ id: tournamentId, name: tournamentName }, { onConflict: 'id' });

      // Clear existing data (in proper order due to foreign key constraints)
      await supabase.from('bracket_positions').delete().eq('tournament_id', tournamentId);
      await supabase.from('scores').delete().eq('tournament_id', tournamentId);
      await supabase.from('matches').delete().eq('tournament_id', tournamentId);
      await supabase.from('rounds').delete().eq('tournament_id', tournamentId);
      await supabase.from('participants').delete().eq('tournament_id', tournamentId);

      // Determine academic year (2 or 3) based on selected tournament
      const tmap = config.TOURNAMENTS || {};
      const yearValue = tmap?.secondYear?.id === tournamentId ? 2 : (tmap?.thirdYear?.id === tournamentId ? 3 : null);

      // Insert participants with proper seeding
      const participantsData = participants.map(participant => {
        const record = {
          tournament_id: tournamentId,
          name: participant.name,
          roll_number: participant.roll_number,
          email: participant.email,
          seed_number: participant.seed_number,
          status: 'active',
          current_round: 1,
          total_wins: 0,
          year: yearValue
        };
        // Include mobile_number only when provided (column is nullable)
        if (participant.mobile_number) {
          record.mobile_number = participant.mobile_number;
        }
        return record;
      });

      const { data: insertedParticipants, error: participantsError } = await supabase
        .from('participants')
        .insert(participantsData)
        .select('id, seed_number');

      if (participantsError) throw participantsError;

      // Sort participants by seed number and create the complete tournament bracket
      const sortedParticipants = insertedParticipants.sort((a, b) => a.seed_number - b.seed_number);
      const participantIds = sortedParticipants.map(p => p.id);

      // ── DEBUG: verify participant IDs immediately before RPC call ──────────
      console.log('[TournamentInitializer] Tournament ID :', tournamentId);
      console.log('[TournamentInitializer] Participant count before RPC:', participantIds.length);
      console.log('[TournamentInitializer] Participant IDs before RPC:', participantIds);
      // ──────────────────────────────────────────────────────────────────────

      // Create complete tournament bracket with all rounds using the advanced function
      const { data, error } = await supabase.rpc('create_complete_tournament_bracket', {
        p_tournament_id: tournamentId,
        p_participant_ids: participantIds
      });

      if (error) throw error;

      // Reload participants from database
      await loadParticipants();

      if (onTournamentCreated) {
        onTournamentCreated({ id: tournamentId, name: tournamentEntry?.name || config.TOURNAMENT_NAME });
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
    <div className="mx-auto p-6 bg-black/20 backdrop-blur-md">
      <h2 className="text-2xl font-bold mb-6 text-white bodoni-moda">Tesseract Setup</h2>

      {/* Info Banner */}
      <div className="bg-[#024028]/20 border border-[#0d9c57]/40 text-white/90 px-4 py-3 rounded mb-6 backdrop-blur-sm">
        <h3 className="font-medium mb-2 bodoni-moda">Tournament Requirements</h3>
        <ul className="text-sm space-y-1">
          {
            (() => {
              const tournamentsMap = config.TOURNAMENTS || {};
              const entry = Object.values(tournamentsMap).find(t => t.id === tournamentId);
              const expected = entry?.maxParticipants || config.MAX_PARTICIPANTS || 64;
              const r1Matches = Math.max(1, expected / 2);
              return (
                <>
                  <li>• Exactly <strong>{expected} participants</strong> required</li>
                  <li>• CSV format: <code className="bg-black/30 px-1 rounded">name,roll_number,email[,mobile_number]</code></li>
                  <li>• <code className="bg-black/30 px-1 rounded">mobile_number</code> is optional (10 digits) — required for participant verification</li>
                  <li>• Seeding calculated automatically using tournament bracket order</li>
                  <li>• Creates {r1Matches} Round 1 matches automatically</li>
                </>
              );
            })()
          }
        </ul>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-400/30 text-red-400 px-4 py-3 rounded mb-4 backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-4">
        <label className="bg-gradient-to-r from-[#024028] to-[#0d9c57] hover:shadow-[0_0_20px_rgba(13,156,87,0.5)] text-white font-semibold px-4 py-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-105 cal-sans-regular">
          {(() => { const tm=config.TOURNAMENTS||{}; const e=Object.values(tm).find(t=>t.id===tournamentId); const exp=e?.maxParticipants||config.MAX_PARTICIPANTS||64; return `Import ${exp} Participants from CSV`; })()}
          <input
            type="file"
            accept=".csv"
            onChange={importFromCSV}
            className="hidden"
          />
        </label>

        <button
          onClick={clearAll}
          className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-4 py-2 rounded backdrop-blur-sm transition-all duration-200 cal-sans-regular"
        >
          Clear All
        </button>
      </div>

      {/* Participants Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white bodoni-moda">
          {(() => { const tm=config.TOURNAMENTS||{}; const e=Object.values(tm).find(t=>t.id===tournamentId); const exp=e?.maxParticipants||config.MAX_PARTICIPANTS||64; return `Participants (${participants.length}/${exp})`; })()}
        </h3>

        {participants.length === 0 ? (
          <p className="text-white/60 text-center py-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 cal-sans-regular">
            {(() => { const tm=config.TOURNAMENTS||{}; const e=Object.values(tm).find(t=>t.id===tournamentId); const exp=e?.maxParticipants||config.MAX_PARTICIPANTS||64; return `No participants added yet. Please upload a CSV file with ${exp} participants.`; })()}
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto border border-white/20 rounded-lg bg-black/30 backdrop-blur-sm">
            <table className="w-full">
              <thead className="bg-[#024028]/30 backdrop-blur-sm sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white/80">Seed</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white/80">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white/80">Roll Number</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white/80">Email</th>
                </tr>
              </thead>
              <tbody>
                {participants
                  .sort((a, b) => a.seed_number - b.seed_number)
                  .map((participant, index) => (
                    <tr key={index} className="border-t border-[#0d9c57]/20 hover:bg-[#024028]/20">
                      <td className="px-4 py-2 text-sm font-medium text-[#0d9c57]">
                        {participant.seed_number}
                      </td>
                      <td className="px-4 py-2 text-sm text-white">{participant.name}</td>
                      <td className="px-4 py-2 text-sm text-white/80">{participant.roll_number}</td>
                      <td className="px-4 py-2 text-sm text-white/80">{participant.email}</td>
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
          disabled={(() => { const tm=config.TOURNAMENTS||{}; const e=Object.values(tm).find(t=>t.id===tournamentId); const exp=e?.maxParticipants||config.MAX_PARTICIPANTS||64; return participants.length !== exp || loading; })()}
          className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${(() => { const tm=config.TOURNAMENTS||{}; const e=Object.values(tm).find(t=>t.id===tournamentId); const exp=e?.maxParticipants||config.MAX_PARTICIPANTS||64; return participants.length === exp && !loading; })()
            ? 'bg-gradient-to-r from-[#024028] to-[#0d9c57] text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(13,156,87,0.55)]'
            : 'bg-white/10 text-white/50 cursor-not-allowed border border-white/20'
            }`}
        >
          {loading ? 'Initializing...' : 'Initialize Tesseract'}
        </button>

        <div className="mt-4">
          {(() => { const tm=config.TOURNAMENTS||{}; const e=Object.values(tm).find(t=>t.id===tournamentId); const exp=e?.maxParticipants||config.MAX_PARTICIPANTS||64; return (
            <p className={`text-sm font-medium ${participants.length === exp ? 'text-[#0d9c57]' : 'text-white/60'}`}>
              Current: {participants.length}/{exp} participants
            </p>
          );})()}
          {(() => { const tm=config.TOURNAMENTS||{}; const e=Object.values(tm).find(t=>t.id===tournamentId); const exp=e?.maxParticipants||config.MAX_PARTICIPANTS||64; return participants.length === exp; })() && (
            <p className="text-xs text-[#0d9c57] flex items-center justify-center mt-1">
              <span className="w-2 h-2 bg-[#0d9c57] rounded-full mr-2 shadow-[0_0_6px_rgba(13,156,87,0.6)]"></span>
              Ready to initialize tournament!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentInitializer;