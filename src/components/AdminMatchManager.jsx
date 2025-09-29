import React, { useState, useEffect } from 'react';
import { tournamentAPI } from '../lib/supabase';
import { useTournament } from '../hooks/useTournament';

const AdminMatchManager = ({ tournamentId }) => {
  const { bracket, participants, loading, error, updateMatchWinner } = useTournament(tournamentId);
  const [openRound, setOpenRound] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [winnerScore, setWinnerScore] = useState('');
  const [loserScore, setLoserScore] = useState('');
  const [isWalkover, setIsWalkover] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showScoresModal, setShowScoresModal] = useState(false);
  const [cumulativeScores, setCumulativeScores] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

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

      const result = await updateMatchWinner(matchId, winnerId, winner, loser, isWalkover);

      // Check if the update was successful
      if (result && result.success === false) {
        throw new Error(result.error || 'Update failed');
      }

      // Reset form
      setSelectedMatch(null);
      setWinnerScore('');
      setLoserScore('');
      setIsWalkover(false);

    } catch (error) {
      alert(`Failed to update match: ${error.message}`);
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
    <div className="admin-match-manager p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">🏆 Match Management</h2>
              <p className="text-gray-600">Manage tournament matches and select winners</p>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-end">
              <button
                onClick={async () => {
                  const base = process.env.REACT_APP_SUPABASE_URL;
                  const anon = process.env.REACT_APP_SUPABASE_ANON_KEY;
                  if (!base) {
                    alert('Supabase URL not configured');
                    return;
                  }
                  setIsExporting(true);
                  try {
                    const url = `${base}/functions/v1/export_excel?tournamentId=${tournamentId}`;
                    const resp = await fetch(url, {
                      method: 'GET',
                      headers: anon ? { Authorization: `Bearer ${anon}` } : undefined,
                    });
                    if (!resp.ok) {
                      const text = await resp.text();
                      throw new Error(text || 'Export failed');
                    }
                    const blob = await resp.blob();
                    const dlUrl = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = dlUrl;
                    const filename = `tournament_${tournamentId}_report.xlsx`;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(dlUrl);
                  } catch (e) {
                    alert(e.message || 'Failed to generate Excel');
                  } finally {
                    setIsExporting(false);
                  }
                }}
                disabled={isExporting}
                className={`px-4 py-2 rounded-lg text-white shadow inline-flex items-center gap-2 ${
                  isExporting ? 'bg-emerald-400 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isExporting ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" aria-hidden="true">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 22h14a2 2 0 0 0 2-2V7l-6-5H6a2 2 0 0 0-2 2v3"/>
                    <path d="M14 2v5h5"/>
                    <path d="M8 13h8"/>
                    <path d="M8 17h8"/>
                    <path d="M8 9h2"/>
                  </svg>
                )}
                {isExporting ? 'Generating…' : 'Export Excel'}
              </button>
              <button
                onClick={async () => {
                  try {
                    const data = await tournamentAPI.getCumulativeScores(tournamentId);
                    setCumulativeScores(Array.isArray(data) ? data : []);
                    setShowScoresModal(true);
                  } catch (e) {
                    alert(`Failed to load scores: ${e.message || e}`);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow inline-flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                Cumulative Scores
              </button>
            </div>
          </div>
        </div>

        {Object.keys(matchesByRound).sort((a, b) => parseInt(a) - parseInt(b)).map(round => (
          <div key={round} className="mb-4">
            <details open={openRound === parseInt(round)} className="bg-white/40 rounded-xl shadow-sm border border-gray-200">
              <summary
                onClick={(e) => {
                  e.preventDefault();
                  setOpenRound((prev) => (prev === parseInt(round) ? null : parseInt(round)));
                }}
                className="cursor-pointer select-none list-none"
              >
                <div className='relative'>
                  <div className="flex  top-0 z-10 items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md">
                    <h3 className="text-lg md:text-xl font-bold text-white">
                      {getRoundName(parseInt(round))}
                    </h3>
                    <span className="ml-4 text-white/90">
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 ease-out ${openRound === parseInt(round) ? 'transform rotate-180' : ''}`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>
                </div>

              </summary>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {matchesByRound[round].map(match => (
                    <div
                      key={match.match_id}
                      className={`bg-white rounded-xl shadow-lg p-5 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${match.status === 'completed'
                        ? 'border-2 border-green-200 bg-green-50'
                        : 'border border-gray-200 hover:border-blue-300'
                        }`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                          Match {match.match_number}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${match.status === 'completed'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          }`}>
                          {match.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${match.winner_id === match.player1?.id
                          ? 'bg-green-50 border-green-300 shadow-md'
                          : 'bg-white border-gray-200 hover:border-blue-200'
                          }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                {match.player1?.seed_number && (
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mr-2">
                                    {match.player1.seed_number}
                                  </span>
                                )}
                                <span className="font-semibold text-gray-800">
                                  {match.player1?.name || 'TBD'}
                                </span>
                              </div>
                              {match.player1?.roll_number && (
                                <div className="text-center mt-1">
                                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                    {match.player1.roll_number}
                                  </span>
                                </div>
                              )}
                            </div>
                            {match.winner_id === match.player1?.id && (
                              <div className="ml-2">
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                  ✓ WINNER
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-center">
                          <span className="inline-block bg-gray-200 text-gray-600 text-sm font-medium px-3 py-1 rounded-full">
                            VS
                          </span>
                        </div>

                        <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${match.winner_id === match.player2?.id
                          ? 'bg-green-50 border-green-300 shadow-md'
                          : 'bg-white border-gray-200 hover:border-blue-200'
                          }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                {match.player2?.seed_number && (
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mr-2">
                                    {match.player2.seed_number}
                                  </span>
                                )}
                                <span className="font-semibold text-gray-800">
                                  {match.player2?.name || 'TBD'}
                                </span>
                              </div>
                              {match.player2?.roll_number && (
                                <div className="text-center mt-1">
                                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                    {match.player2.roll_number}
                                  </span>
                                </div>
                              )}
                            </div>
                            {match.winner_id === match.player2?.id && (
                              <div className="ml-2">
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                  ✓ WINNER
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {match.status !== 'completed' && match.player1 && match.player2 && (
                        <button
                          onClick={() => setSelectedMatch(match)}
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                          🏆 Set Winner
                        </button>
                      )}

                      {match.status === 'completed' && (
                        <div className="w-full text-center py-2">
                          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                            ✅ Match Completed
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </details>
          </div>
        ))}

        {/* Winner Selection Modal */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 transform transition-all">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  🏆 Set Winner
                </h3>
                <p className="text-sm text-gray-600">
                  Match {selectedMatch.match_number} - {getRoundName(selectedMatch.round_number)}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Select the winner:</p>
                <div className="space-y-3">
                  <button
                    onClick={() => handleUpdateMatch(selectedMatch.match_id, selectedMatch.player1?.id)}
                    disabled={updating}
                    className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {selectedMatch.player1?.seed_number && (
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-800 text-sm font-bold rounded-full mr-3">
                            {selectedMatch.player1.seed_number}
                          </span>
                        )}
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            {selectedMatch.player1?.name}
                          </span>
                          <span className="text-sm text-gray-600">
                            {selectedMatch.player1?.roll_number}
                          </span>
                        </div>
                      </div>
                      <div className="text-blue-500 group-hover:text-blue-600 transition-colors">
                        👑
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleUpdateMatch(selectedMatch.match_id, selectedMatch.player2?.id)}
                    disabled={updating}
                    className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {selectedMatch.player2?.seed_number && (
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-800 text-sm font-bold rounded-full mr-3">
                            {selectedMatch.player2.seed_number}
                          </span>
                        )}
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            {selectedMatch.player2?.name}
                          </span>
                          <span className="text-sm text-gray-600">
                            {selectedMatch.player2?.roll_number}
                          </span>
                        </div>
                      </div>
                      <div className="text-blue-500 group-hover:text-blue-600 transition-colors">
                        👑
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={isWalkover}
                    onChange={(e) => setIsWalkover(e.target.checked)}
                    className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Walkover (no scores needed)</span>
                </label>
              </div>

              {!isWalkover && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Match Scores:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Winner Score
                      </label>
                      <input
                        type="number"
                        value={winnerScore}
                        onChange={(e) => setWinnerScore(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loser Score
                      </label>
                      <input
                        type="number"
                        value={loserScore}
                        onChange={(e) => setLoserScore(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-2 text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedMatch(null)}
                  disabled={updating}
                  className="px-6 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors font-medium"
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

        {/* Cumulative Scores Modal */}
        {showScoresModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-4 transform transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Cumulative Scores</h3>
                <button
                  onClick={() => setShowScoresModal(false)}
                  className="px-3 py-1 text-sm text-black bg-gray-100 hover:bg-gray-200 rounded border"
                >
                  Close
                </button>
              </div>
              <div className="overflow-auto max-h-[70vh]">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-3 py-2">Roll No</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Total Points</th>
                      <th className="px-3 py-2">Wins</th>
                      <th className="px-3 py-2">Losses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cumulativeScores.map((r) => (
                      <tr key={r.player_id} className="border-b last:border-0 text-black">
                        <td className="px-3 py-2 whitespace-nowrap">{r.roll_number}</td>
                        <td className="px-3 py-2">{r.player_name}</td>
                        <td className="px-3 py-2">{r.total_points}</td>
                        <td className="px-3 py-2">{r.wins}</td>
                        <td className="px-3 py-2">{r.losses}</td>
                      </tr>
                    ))}
                    {cumulativeScores.length === 0 && (
                      <tr>
                        <td className="px-3 py-6 text-center text-gray-500" colSpan={5}>No data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMatchManager;