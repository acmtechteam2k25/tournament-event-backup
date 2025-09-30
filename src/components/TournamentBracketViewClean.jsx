import React, { useState, useEffect } from 'react';
import { generateColumns, calculatePositionOfMatch, getPreviousMatches, BRACKET_CONFIG } from '../utils/bracketPositioning';
import { useTournament } from '../hooks/useTournament';
import Connector from './Connector';
import MatchBox from './MatchBox';
import './TournamentBracketView.css';

const TournamentBracketViewFinal = ({ isEditable = false, tournamentId = null }) => {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [winnerScore, setWinnerScore] = useState('');
  const [loserScore, setLoserScore] = useState('');
  const [isWalkover, setIsWalkover] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Use tournament hook for database integration (only if tournamentId is provided)
  const { bracket, loading, error, updateMatchWinner } = useTournament(tournamentId);

  useEffect(() => {
    if (tournamentId) {
      // Always use database data when tournament ID is provided
      if (bracket.length > 0) {
        console.log('Database bracket data:', bracket);
        console.log('Looking for matches with player advancement issues...');

        // Debug: Check for TBD players in Round 2+ that should have been filled
        const round2Matches = bracket.filter(m => m.round_number === 2);
        round2Matches.forEach(match => {
          console.log(`Round 2 Match ${match.match_number}:`, {
            player1: match.player1?.name || 'TBD',
            player2: match.player2?.name || 'TBD',
            matchId: match.match_id
          });
        });

        // Debug: Check Round 1 matches and their next_match_id relationships
        const round1Matches = bracket.filter(m => m.round_number === 1);
        round1Matches.forEach(match => {
          console.log(`Round 1 Match ${match.match_number}:`, {
            winner: match.winner_id ?
              (match.player1?.id === match.winner_id ? match.player1.name : match.player2?.name) :
              'No winner yet',
            nextMatchId: match.next_match_id,
            status: match.status
          });
        });

        // Convert database format to component format
        const formattedMatches = bracket.map(match => ({
          id: match.match_id,
          tournamentRoundText: match.round_number.toString(),
          roundNumber: match.round_number,
          matchNumber: match.match_number,
          resultText: match.status === 'completed' ? 'Winner' : '',
          state: match.status === 'completed' ? 'SCORE_DONE' : 'NO_SHOW',
          participants: [
            match.player1 ? {
              id: match.player1.id,
              name: match.player1.name,
              rollNumber: match.player1.roll_number,
              resultText: match.winner_id === match.player1.id ? 'WINNER' : null,
              isWinner: match.winner_id === match.player1.id,
              status: match.player1.status,
              seed: match.player1.seed_number
            } : { name: 'TBD', id: null },
            match.player2 ? {
              id: match.player2.id,
              name: match.player2.name,
              rollNumber: match.player2.roll_number,
              resultText: match.winner_id === match.player2.id ? 'WINNER' : null,
              isWinner: match.winner_id === match.player2.id,
              status: match.player2.status,
              seed: match.player2.seed_number
            } : { name: 'TBD', id: null }
          ],
          nextMatchId: match.next_match_id,
          position: match.match_position
        }));
        console.log('Formatted matches:', formattedMatches);
        setMatches(formattedMatches);
      } else {
        // Show empty bracket while loading database data
        setMatches([]);
      }
    } else {
      // Fallback to sample data if no tournament ID
      const savedData = localStorage.getItem('acm_tournament_data');

      let needsRegeneration = false;
      if (savedData) {
        try {
          const tournamentData = JSON.parse(savedData);
          const firstRoundMatches = tournamentData.filter(match => match.tournamentRoundText === '1');
          const totalFirstRoundPlayers = firstRoundMatches.reduce((count, match) => count + match.participants.length, 0);
          if (totalFirstRoundPlayers < 64) {
            needsRegeneration = true;
          }
        } catch (error) {
          needsRegeneration = true;
        }
      }

      if (savedData && !needsRegeneration) {
        const tournamentData = JSON.parse(savedData);
        setMatches(tournamentData);
      }
    }
  }, [tournamentId, bracket]);

  const handleMatchClick = (match, x, y) => {
    // Only allow clicking if in editable mode
    if (!isEditable) return;

    const isCurrentlySelected = selectedMatch?.id === match.id;
    setSelectedMatch(isCurrentlySelected ? null : match);

    if (!isCurrentlySelected && match) {
      // If match is completed, pre-populate form with existing data
      if (match.state === 'SCORE_DONE') {
        const winner = match.participants.find(p => p.isWinner);
        const loser = match.participants.find(p => !p.isWinner);

        if (winner) {
          setSelectedWinner(winner);
          // For editing, set reasonable default scores
          // TODO: In future, fetch actual scores from database
          setWinnerScore('10');
          setLoserScore('8');
          setIsWalkover(winner.status === 'walkover' || loser?.status === 'walkover');
        } else {
          // Reset form for completed match without clear winner
          setSelectedWinner(null);
          setWinnerScore('');
          setLoserScore('');
          setIsWalkover(false);
        }
      } else {
        // Reset form for new match selection
        setSelectedWinner(null);
        setWinnerScore('');
        setLoserScore('');
        setIsWalkover(false);
      }
    } else {
      // Closing modal - reset form
      setSelectedWinner(null);
      setWinnerScore('');
      setLoserScore('');
      setIsWalkover(false);
    }
  };

  const handleWinnerSelect = async () => {
    if (!selectedWinner) {
      alert('Please select a winner first.');
      return;
    }

    // Add confirmation for editing completed matches
    if (selectedMatch.state === 'SCORE_DONE') {
      const confirmed = window.confirm(
        `⚠️ This will update the winner for Round ${selectedMatch.roundNumber}, Match ${selectedMatch.matchNumber}.\n\n` +
        `This may affect subsequent rounds if participants have already advanced.\n\n` +
        `Are you sure you want to continue?`
      );

      if (!confirmed) {
        return;
      }
    }

    // Validate scores if not a walkover
    if (!isWalkover) {
      const winnerNum = parseInt(winnerScore);
      const loserNum = parseInt(loserScore);

      if (isNaN(winnerNum) || isNaN(loserNum)) {
        alert('Please enter valid numeric scores.');
        return;
      }

      if (winnerNum < 0 || loserNum < 0) {
        alert('Scores cannot be negative.');
        return;
      }

      // Validate that winner's score is higher than loser's score
      if (winnerNum <= loserNum) {
        alert('Winner must have a higher score than the opponent. Please check the scores or use walkover if appropriate.');
        return;
      }
    }

    setUpdating(true);

    if (tournamentId && updateMatchWinner) {
      // Update via database
      try {
        const winner = parseInt(winnerScore) || 0;
        const loser = parseInt(loserScore) || 0;

        console.log('Updating match winner:', {
          matchId: selectedMatch.id,
          winnerId: selectedWinner.id,
          winnerScore: winner,
          loserScore: loser,
          isWalkover
        });

        const result = await updateMatchWinner(selectedMatch.id, selectedWinner.id, winner, loser, isWalkover);

        console.log('Update result:', result);
        console.log('Debug info from database:', result?.debug_info);

        // Reset form
        setSelectedMatch(null);
        setSelectedWinner(null);
        setWinnerScore('');
        setLoserScore('');
        setIsWalkover(false);
      } catch (error) {
        console.error('Failed to update match:', error);
        alert('Failed to update match. Please try again.');
      }
    }

    setUpdating(false);
  };

  const getVisibleMatches = (allMatches) => {
    // Admin view: show everything
    if (isEditable) return allMatches;

    // Public view: show complete tournament tree (all rounds and matches)
    // This allows viewers to see the full bracket structure including TBD matches
    return allMatches;
  };

  const visibleMatches = getVisibleMatches(matches);
  const columns = generateColumns(visibleMatches);
  const style = BRACKET_CONFIG;


  if (!columns.length) {
    return <div className="loading h-[100vh] flex justify-center items-center">Loading tournament bracket...</div>;
  }

  // Calculate SVG dimensions based on bracket structure
  const svgWidth = columns.length * style.columnWidth + style.canvasPadding * 2;
  const svgHeight = 32 * style.rowHeight + style.canvasPadding * 2; // 32 matches max in first round

  // Show loading state
  if (tournamentId && loading) {
    return (
      <div className="tournament-bracket">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tournament bracket...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="tournament-bracket">
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-red-600">
            <p className="text-lg font-medium">Error loading tournament</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tournament-bracket">
      <div className="bracket-scrollable-container">
        <div className="bracket-content">
          <svg
            className="bracket-svg"
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          >
            {columns.map((matchesColumn, columnIndex) =>
              matchesColumn.map((match, rowIndex) => {
                const { x, y } = calculatePositionOfMatch(rowIndex, columnIndex, style);
                const { previousTopMatch, previousBottomMatch } = getPreviousMatches(
                  columnIndex,
                  columns,
                  rowIndex,
                  match
                );

                return (
                  <g key={`${columnIndex}-${rowIndex}-${match.id}`}>
                    {/* Round header */}
                    {rowIndex === 0 && (
                      <foreignObject
                        x={x}
                        y={style.canvasPadding}
                        width={style.gameWidth}
                        height={40}
                      >
                        <div className="svg-round-header">
                          <h3>
                            {match.tournamentRoundText === '6' ? 'Final' :
                              match.tournamentRoundText === '5' ? 'Final Semi' :
                                match.tournamentRoundText === '4' ? 'Semi Final' :
                                  match.tournamentRoundText === '3' ? 'Quarter Final' :
                                    `Round ${match.tournamentRoundText}`}
                          </h3>
                        </div>
                      </foreignObject>
                    )}

                    {/* Connector lines */}
                    {columnIndex !== 0 && previousTopMatch && previousBottomMatch && (
                      <Connector
                        bracketSnippet={{
                          currentMatch: match,
                          previousTopMatch,
                          previousBottomMatch,
                        }}
                        rowIndex={rowIndex}
                        columnIndex={columnIndex}
                        gameHeight={style.gameHeight}
                        gameWidth={style.gameWidth}
                        style={style}
                      />
                    )}

                    {/* Match box */}
                    <foreignObject
                      x={x}
                      y={y}
                      width={style.gameWidth}
                      height={style.gameHeight}
                    >
                      <MatchBox
                        match={match}
                        onMatchClick={() => handleMatchClick(match, x, y)}
                        isSelected={selectedMatch?.id === match.id}
                        gameWidth={style.gameWidth}
                        gameHeight={style.gameHeight}
                      />
                    </foreignObject>
                  </g>
                );
              })
            )}
          </svg>
        </div>
      </div>

      {/* Enhanced Winner selection modal with score inputs - show in editable mode for all matches */}
      {isEditable && selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 transform transition-all">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {selectedMatch.state === 'SCORE_DONE' ? '🔄 Edit Winner' : '🏆 Set Winner'}
              </h3>
              <p className="text-sm text-gray-600">
                Match {selectedMatch.matchNumber} - Round {selectedMatch.roundNumber}
                {selectedMatch.state === 'SCORE_DONE' && (
                  <span className="block text-orange-600 font-medium mt-1">
                    ⚠️ Editing completed match
                  </span>
                )}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Select the winner:</p>
              <div className="space-y-3">
                {selectedMatch.participants.filter(p => p?.name && p.name !== 'TBD').map((participant) => (
                  <button
                    key={participant.id}
                    onClick={() => setSelectedWinner(participant)}
                    disabled={updating}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${selectedWinner?.id === participant.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {participant.seed && (
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-800 text-sm font-bold rounded-full mr-3">
                            {participant.seed}
                          </span>
                        )}
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            {participant.name}
                          </span>
                          <span className="text-sm text-gray-600">
                            {participant.rollNumber}
                          </span>
                        </div>
                      </div>
                      <div className={`transition-colors ${selectedWinner?.id === participant.id ? 'text-blue-600' : 'text-blue-500'
                        }`}>
                        {selectedWinner?.id === participant.id ? '✓' : '👑'}
                      </div>
                    </div>
                  </button>
                ))}
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

            {!isWalkover && selectedWinner && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Match Scores:</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {selectedWinner.name} (Winner)
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
                      {selectedMatch.participants.find(p => p.id !== selectedWinner.id)?.name || 'Opponent'}
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
                {selectedMatch.state === 'SCORE_DONE' && (
                  <p className="text-xs text-orange-600 mt-2">
                    💡 Editing completed match: Default scores shown. Update as needed.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedMatch(null);
                  setSelectedWinner(null);
                  setWinnerScore('');
                  setLoserScore('');
                  setIsWalkover(false);
                }}
                disabled={updating}
                className="px-6 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors font-medium"
              >
                Cancel
              </button>
              {selectedWinner && (
                <button
                  onClick={handleWinnerSelect}
                  disabled={updating}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors font-medium"
                >
                  {updating ? 'Updating...' : selectedMatch.state === 'SCORE_DONE' ? 'Update Winner' : 'Confirm Winner'}
                </button>
              )}
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

export default TournamentBracketViewFinal;