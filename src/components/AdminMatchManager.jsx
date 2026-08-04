import React, { useState } from 'react';
import { tournamentAPI } from '../lib/supabase';
import { useTournament } from '../hooks/useTournament';

const AdminMatchManager = ({ tournamentId }) => {
  const { bracket, loading, error } = useTournament(tournamentId);
  const [openRound, setOpenRound] = useState(null);
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
      <div className="admin-match-manager p-6 bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d9c57] mx-auto mb-4"></div>
          <p className="text-white">Loading tournament data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-match-manager p-6 bg-black">
        <div className="text-center text-red-400">
          <p className="text-lg font-medium">Error loading tournament</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-match-manager p-6 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">🏆 Match Management</h2>
              <p className="text-white/70">Manage tournament matches and select winners</p>
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
                className={`group relative overflow-hidden px-4 py-2 rounded-full text-white shadow inline-flex items-center gap-2 transition-all duration-300 hover:scale-105 ${isExporting ? 'bg-gradient-to-r from-[#024028]/60 to-[#0d9c57]/60 cursor-wait' : 'bg-gradient-to-r from-[#024028] to-[#0d9c57] hover:shadow-[0_0_20px_rgba(13,156,87,0.6)]'}`}
              >
                {isExporting ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" aria-hidden="true">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 22h14a2 2 0 0 0 2-2V7l-6-5H6a2 2 0 0 0-2 2v3" />
                    <path d="M14 2v5h5" />
                    <path d="M8 13h8" />
                    <path d="M8 17h8" />
                    <path d="M8 9h2" />
                  </svg>
                )}
                {isExporting ? 'Generating…' : 'Export Excel'}
              </button>
              <button
                onClick={async () => {
                  try {
                    const result = await tournamentAPI.processAutomaticByes(tournamentId);
                    alert(`Processed ${result.byes_processed} automatic byes`);
                    window.location.reload(); // Refresh to show updated matches
                  } catch (error) {
                    alert('Failed to process byes: ' + error.message);
                  }
                }}
                className="group relative overflow-hidden px-4 py-2 rounded-full bg-gradient-to-r from-[#024028] to-[#0d9c57] text-white shadow inline-flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(13,156,87,0.6)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                  <path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                </svg>
                Process Byes
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
                className="group relative overflow-hidden px-4 py-2 rounded-full bg-gradient-to-r from-[#024028] to-[#0d9c57] text-white shadow inline-flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(13,156,87,0.6)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Cumulative Scores
              </button>
            </div>
          </div>
        </div>

        {Object.keys(matchesByRound).sort((a, b) => parseInt(a) - parseInt(b)).map(round => (
          <div key={round} className="mb-4">
            <details open={openRound === parseInt(round)} className="bg-black/20 backdrop-blur-sm rounded-xl border border-[#0d9c57]/40">
              <summary
                onClick={(e) => {
                  e.preventDefault();
                  setOpenRound((prev) => (prev === parseInt(round) ? null : parseInt(round)));
                }}
                className="cursor-pointer select-none list-none"
              >
                <div className='relative'>
                  <div className="flex top-0 z-10 items-center justify-between px-6 py-4 bg-gradient-to-r from-[#024028] to-[#0d9c57] rounded-md hover:shadow-[0_0_20px_rgba(13,156,87,0.4)] transition-all duration-300">
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
                      className={`bg-black/30 backdrop-blur-sm rounded-xl border-2 p-5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(13,156,87,0.2)] transform hover:-translate-y-1 ${match.status === 'completed'
                        ? 'border-[#0d9c57] bg-[#024028]/20'
                        : 'border-[#0d9c57]/40 hover:border-[#0d9c57]/80'
                        }`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-white/80 bg-black/40 px-3 py-1 rounded-full border border-[#0d9c57]/40">
                          Match {match.match_number}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${match.status === 'completed'
                          ? 'bg-[#0d9c57]/20 text-[#0d9c57] border border-[#0d9c57]/40'
                          : 'bg-[#024028]/40 text-white/80 border border-[#0d9c57]/40'
                          }`}>
                          {match.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${match.winner_id === match.player1?.id
                          ? 'bg-[#024028]/30 border-[#0d9c57] shadow-[0_0_10px_rgba(13,156,87,0.3)]'
                          : 'bg-black/40 border-[#0d9c57]/40 hover:border-[#0d9c57]/60'
                          }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                {match.player1?.seed_number && (
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-[#0d9c57]/20 text-[#0d9c57] text-xs font-bold rounded-full mr-2 border border-[#0d9c57]/40">
                                    {match.player1.seed_number}
                                  </span>
                                )}
                                <span className="font-semibold text-white">
                                  {match.player1?.name || 'TBD'}
                                </span>
                              </div>
                              {match.player1?.roll_number && (
                                <div className="text-center mt-1">
                                  <span className="inline-block bg-black/40 text-white/70 text-xs px-2 py-1 rounded border border-[#0d9c57]/40">
                                    {match.player1.roll_number}
                                  </span>
                                </div>
                              )}
                            </div>
                            {match.winner_id === match.player1?.id && (
                              <div className="ml-2">
                                <span className="inline-flex items-center px-2 py-1 bg-[#0d9c57]/20 text-[#0d9c57] text-xs font-bold rounded-full border border-[#0d9c57]/40">
                                  ✓ WINNER
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-center">
                          <span className="inline-block bg-black/40 text-white/70 text-sm font-medium px-3 py-1 rounded-full border border-[#0d9c57]/40">
                            VS
                          </span>
                        </div>

                        <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${match.winner_id === match.player2?.id
                          ? 'bg-[#024028]/30 border-[#0d9c57] shadow-[0_0_10px_rgba(13,156,87,0.3)]'
                          : 'bg-black/40 border-[#0d9c57]/40 hover:border-[#0d9c57]/60'
                          }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                {match.player2?.seed_number && (
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-[#0d9c57]/20 text-[#0d9c57] text-xs font-bold rounded-full mr-2 border border-[#0d9c57]/40">
                                    {match.player2.seed_number}
                                  </span>
                                )}
                                <span className="font-semibold text-white">
                                  {match.player2?.name || 'TBD'}
                                </span>
                              </div>
                              {match.player2?.roll_number && (
                                <div className="text-center mt-1">
                                  <span className="inline-block bg-black/40 text-white/70 text-xs px-2 py-1 rounded border border-[#0d9c57]/40">
                                    {match.player2.roll_number}
                                  </span>
                                </div>
                              )}
                            </div>
                            {match.winner_id === match.player2?.id && (
                              <div className="ml-2">
                                <span className="inline-flex items-center px-2 py-1 bg-[#0d9c57]/20 text-[#0d9c57] text-xs font-bold rounded-full border border-[#0d9c57]/40">
                                  ✓ WINNER
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {match.status !== 'completed' && match.player1 && match.player2 && (
                        <div className="w-full text-center py-3">
                          <span className="inline-flex items-center px-3 py-1 bg-black/40 text-white/70 text-sm font-medium rounded-full border border-[#0d9c57]/40">
                            ⚡ Use Bracket View to set winner
                          </span>
                        </div>
                      )}

                      {match.status === 'completed' && (
                        <div className="w-full text-center py-2">
                          <span className="inline-flex items-center px-3 py-1 bg-[#0d9c57]/20 text-[#0d9c57] text-sm font-medium rounded-full border border-[#0d9c57]/40">
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

        {/* Cumulative Scores Modal */}
        {showScoresModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 border border-[#0d9c57]/40 rounded-xl shadow-[0_0_30px_rgba(13,156,87,0.2)] p-6 w-full max-w-4xl mx-4 transform transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Cumulative Scores</h3>
                <button
                  onClick={() => setShowScoresModal(false)}
                  className="group relative overflow-hidden px-4 py-2 rounded-full bg-gradient-to-r from-[#024028] to-[#0d9c57] text-white shadow inline-flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(13,156,87,0.6)]"
                >
                  Close
                </button>
              </div>
              <div className="overflow-auto max-h-[70vh]">
                <table className="min-w-full text-left text-sm border border-[#0d9c57]/40">
                  <thead className="bg-[#024028]/30 text-white">
                    <tr>
                      <th className="px-4 py-3 border-b border-[#0d9c57]/40">Roll No</th>
                      <th className="px-4 py-3 border-b border-[#0d9c57]/40">Name</th>
                      <th className="px-4 py-3 border-b border-[#0d9c57]/40">Total Points</th>
                      <th className="px-4 py-3 border-b border-[#0d9c57]/40">Wins</th>
                      <th className="px-4 py-3 border-b border-[#0d9c57]/40">Losses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cumulativeScores.map((r) => (
                      <tr key={r.player_id} className="border-b border-[#0d9c57]/20 last:border-0 text-white hover:bg-[#024028]/10">
                        <td className="px-4 py-3 whitespace-nowrap">{r.roll_number}</td>
                        <td className="px-4 py-3">{r.player_name}</td>
                        <td className="px-4 py-3">{r.total_points}</td>
                        <td className="px-4 py-3">{r.wins}</td>
                        <td className="px-4 py-3">{r.losses}</td>
                      </tr>
                    ))}
                    {cumulativeScores.length === 0 && (
                      <tr>
                        <td className="px-4 py-6 text-center text-white/50" colSpan={5}>No data</td>
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