import React, { useState, useEffect } from 'react';
import { generateSamplePlayers, generateTournamentMatches } from '../data/sampleData';
import { generateColumns, calculatePositionOfMatch, getPreviousMatches, BRACKET_CONFIG } from '../utils/bracketPositioning';
import Connector from './Connector';
import MatchBox from './MatchBox';
import './TournamentBracketView.css';

const TournamentBracketViewFinal = ({ isEditable = false }) => {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Load tournament data from localStorage if available, otherwise generate sample data
    const savedData = localStorage.getItem('acm_tournament_data');
    if (savedData) {
      const tournamentData = JSON.parse(savedData);
      setMatches(tournamentData);
    } else {
      // Generate 32 players for a complete 6-round tournament  
      const players = generateSamplePlayers(32);
      const tournamentData = generateTournamentMatches(players);
      console.log('Tournament data generated:', tournamentData.slice(0, 3)); // Debug first 3 matches
      setMatches(tournamentData);
    }
  }, []);

  const handleMatchClick = (match, x, y) => {
    // Only allow clicking if in editable mode
    if (!isEditable) return;

    console.log('Match clicked:', match.name);
    setSelectedMatch(selectedMatch?.id === match.id ? null : match);
    setOverlayPosition({ x: x + 200, y: y + 120 }); // Position overlay relative to match
  };

  const handleWinnerSelect = (matchId, winnerId, isWalkover = false) => {
    setMatches(prevMatches => {
      const updatedMatches = prevMatches.map(match => {
        if (match.id === matchId) {
          const updatedParticipants = match.participants.map(p => ({
            ...p,
            isWinner: p.id === winnerId,
            status: p.id === winnerId ? (isWalkover ? 'WALKOVER' : 'PLAYED') : 'PLAYED',
            resultText: p.id === winnerId ? (isWalkover ? 'Won (W/O)' : 'Won') : 'Lost'
          }));

          return {
            ...match,
            participants: updatedParticipants,
            state: 'SCORE_DONE'
          };
        }
        return match;
      });

      // Advance winner to next round
      const currentMatch = updatedMatches.find(m => m.id === matchId);
      if (currentMatch && currentMatch.nextMatchId) {
        const winner = currentMatch.participants.find(p => p.isWinner);
        if (winner) {
          const nextMatchIndex = updatedMatches.findIndex(m => m.id === currentMatch.nextMatchId);
          if (nextMatchIndex !== -1) {
            const nextMatch = updatedMatches[nextMatchIndex];
            const updatedNextMatch = {
              ...nextMatch,
              participants: [...nextMatch.participants, {
                id: winner.id,
                name: winner.name,
                resultText: null,
                isWinner: false,
                status: 'SCHEDULED'
              }]
            };
            updatedMatches[nextMatchIndex] = updatedNextMatch;
          }
        }
      }

      // Save updated data to localStorage
      localStorage.setItem('acm_tournament_data', JSON.stringify(updatedMatches));

      // Close overlay after selection
      setSelectedMatch(null);
      return updatedMatches;
    });
  };

  // In participant (public) view, only show:
  // - matches from the current (active) round, and
  // - matches that have already finished (winners declared or walkover)
  const getCurrentRound = (allMatches) => {
    const roundOrder = ['1', '2', '3', '4', '5', '6'];
    for (const round of roundOrder) {
      const roundMatches = allMatches.filter(m => m.tournamentRoundText === round);
      if (roundMatches.length === 0) continue;
      const hasPending = roundMatches.some(m => m.state !== 'SCORE_DONE');
      if (hasPending) return round;
    }
    // If everything is completed, treat final round as current for display
    return '6';
  };

  const getVisibleMatches = (allMatches) => {
    if (isEditable) return allMatches;
    const currentRound = getCurrentRound(allMatches);
    return allMatches.filter(m => (
      m.tournamentRoundText === currentRound || m.state === 'SCORE_DONE'
    ));
  };

  const visibleMatches = getVisibleMatches(matches);
  const columns = generateColumns(visibleMatches);
  const style = BRACKET_CONFIG;

  if (!columns.length) {
    return <div className="loading">Loading tournament bracket...</div>;
  }

  // Calculate SVG dimensions based on bracket structure
  const svgWidth = columns.length * style.columnWidth + style.canvasPadding * 2;
  const svgHeight = 32 * style.rowHeight + style.canvasPadding * 2; // 32 matches max in first round

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

      {/* Minimal Winner selection overlay - only show in editable mode */}
      {isEditable && selectedMatch && selectedMatch.state !== 'SCORE_DONE' && (
        <div
          className="minimal-match-overlay"
          style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000
          }}
        >
          <div className="overlay-header">
            <h3>Update Match Result</h3>
            <p>{selectedMatch.name}</p>
          </div>

          <div className="participants-list">
            {/* Show buttons only if there are actual participants (not TBD) */}
            {selectedMatch.participants.filter(p => p?.name && p.name !== 'TBD').length > 0 ? (
              selectedMatch.participants.filter(p => p?.name && p.name !== 'TBD').map((participant) => (
                <div key={participant.id} className="participant-option">
                  <div className="participant-info">
                    <div className="radio-circle"></div>
                    <span className="participant-name">{participant.name}</span>
                  </div>
                  <div className="participant-actions">
                    <button
                      className="compact-winner-btn"
                      onClick={() => handleWinnerSelect(selectedMatch.id, participant.id, false)}
                    >
                      Win
                    </button>
                    <button
                      className="compact-walkover-btn"
                      onClick={() => handleWinnerSelect(selectedMatch.id, participant.id, true)}
                    >
                      W/O
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-participants">
                <p>Waiting for participants from previous matches</p>
              </div>
            )}
          </div>

          <div className="overlay-footer">
            <button
              className="cancel-overlay-btn"
              onClick={() => setSelectedMatch(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Overlay backdrop - only show in editable mode */}
      {isEditable && selectedMatch && selectedMatch.state !== 'SCORE_DONE' && (
        <div
          className="overlay-backdrop"
          onClick={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
};

export default TournamentBracketViewFinal;