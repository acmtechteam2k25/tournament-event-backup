import React, { useState, useEffect } from 'react';
import { useTournament } from '../hooks/useTournament';

const AdminMatchManager = ({ tournamentId }) => {
  const { bracket, participants, loading, error, updateMatchWinner } = useTournament(tournamentId);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [winnerScore, setWinnerScore] = useState('');
  const [loserScore, setLoserScore] = useState('');
  const [isWalkover, setIsWalkover] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Group matches by rounds
  const matchesByRound = bracket.reduce((acc, match) => {
    const round = match.round_number;
    if (!acc[round]) acc[round] = [];
    acc[round].push(match);
    return acc;
  }, {});

  const handleUpdateMatch = async (matchId, winnerId) => {
    if (!winnerId) return;
    
    setUpdating(true);
    try {
      const winner = parseInt(winnerScore) || 0;
      const loser = parseInt(loserScore) || 0;
      
      await updateMatchWinner(matchId, winnerId, winner, loser, isWalkover);
      
      // Reset form
      setSelectedMatch(null);
      setWinnerScore('');
      setLoserScore('');
      setIsWalkover(false);
      
      alert('Match updated successfully!');
    } catch (error) {
      alert('Failed to update match. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getRoundName = (roundNumber) => {
    const names = {
      1: 'Round 1',
      2: 'Round 2', 
      3: 'Round 3',
      4: 'Quarter Finals',
      5: 'Semi Finals',
      6: 'Final'
    };
    return names[roundNumber] || `Round ${roundNumber}`;
  };

  if (loading) {
    return (
      <div className="admin-match-manager p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading tournament data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-match-manager p-6">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium">Error loading tournament</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-match-manager p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Match Management</h2>
      
      {Object.keys(matchesByRound).sort((a, b) => parseInt(a) - parseInt(b)).map(round => (
        <div key={round} className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">
            {getRoundName(parseInt(round))}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchesByRound[round].map(match => (
              <div 
                key={match.match_id} 
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  match.status === 'completed' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-600">
                    Match {match.match_number}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    match.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {match.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className={`p-2 rounded ${
                    match.winner_id === match.player1?.id ? 'bg-yellow-100 border border-yellow-300' : 'bg-white'
                  }`}>
                    <span className="font-medium">
                      {match.player1?.seed_number && `(${match.player1.seed_number}) `}
                      {match.player1?.name || 'TBD'}
                    </span>
                    {match.player1?.roll_number && (
                      <span className="text-sm text-gray-500 ml-2">
                        ({match.player1.roll_number})
                      </span>
                    )}
                    {match.winner_id === match.player1?.id && (
                      <span className="text-green-600 font-bold ml-2">✓ WINNER</span>
                    )}
                  </div>
                  
                  <div className="text-center text-gray-400 text-sm">vs</div>
                  
                  <div className={`p-2 rounded ${
                    match.winner_id === match.player2?.id ? 'bg-yellow-100 border border-yellow-300' : 'bg-white'
                  }`}>
                    <span className="font-medium">
                      {match.player2?.seed_number && `(${match.player2.seed_number}) `}
                      {match.player2?.name || 'TBD'}
                    </span>
                    {match.player2?.roll_number && (
                      <span className="text-sm text-gray-500 ml-2">
                        ({match.player2.roll_number})
                      </span>
                    )}
                    {match.winner_id === match.player2?.id && (
                      <span className="text-green-600 font-bold ml-2">✓ WINNER</span>
                    )}
                  </div>
                </div>

                {match.status !== 'completed' && match.player1 && match.player2 && (
                  <button
                    onClick={() => setSelectedMatch(match)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors duration-200"
                  >
                    Set Winner
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Winner Selection Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">
              Set Winner - Match {selectedMatch.match_number}
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Select Winner:</p>
              <div className="space-y-2">
                <button
                  onClick={() => handleUpdateMatch(selectedMatch.match_id, selectedMatch.player1?.id)}
                  disabled={updating}
                  className="w-full p-3 text-left border rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="font-medium">
                    {selectedMatch.player1?.seed_number && `(${selectedMatch.player1.seed_number}) `}
                    {selectedMatch.player1?.name}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({selectedMatch.player1?.roll_number})
                  </span>
                </button>
                
                <button
                  onClick={() => handleUpdateMatch(selectedMatch.match_id, selectedMatch.player2?.id)}
                  disabled={updating}
                  className="w-full p-3 text-left border rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="font-medium">
                    {selectedMatch.player2?.seed_number && `(${selectedMatch.player2.seed_number}) `}
                    {selectedMatch.player2?.name}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({selectedMatch.player2?.roll_number})
                  </span>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isWalkover}
                  onChange={(e) => setIsWalkover(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Walkover (no scores needed)</span>
              </label>
            </div>

            {!isWalkover && (
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Winner Score
                  </label>
                  <input
                    type="number"
                    value={winnerScore}
                    onChange={(e) => setWinnerScore(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loser Score
                  </label>
                  <input
                    type="number"
                    value={loserScore}
                    onChange={(e) => setLoserScore(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedMatch(null)}
                disabled={updating}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            {updating && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Updating match...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMatchManager;