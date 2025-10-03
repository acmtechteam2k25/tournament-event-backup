import React, { useState, useEffect, useRef } from "react";
import { tournamentAPI } from "../lib/supabase";
import {
  generateColumns,
  calculatePositionOfMatch,
  getPreviousMatches,
  BRACKET_CONFIG,
} from "../utils/bracketPositioning";
import { useTournament } from "../hooks/useTournament";
import Connector from "./Connector";
import MatchBox from "./MatchBox";
import "./TournamentBracketView.css";

const TournamentBracketViewFinal = ({
  isEditable = false,
  tournamentId = null,
  viewMode = 'full',
  visibleRounds = null,
}) => {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [winnerScore, setWinnerScore] = useState("");
  const [loserScore, setLoserScore] = useState("");
  const [isWalkover, setIsWalkover] = useState(false);
  const [isBye, setIsBye] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [cumulativeScores, setCumulativeScores] = useState([]);
  const [scale, setScale] = useState(1);
  const [lastPinchDistance, setLastPinchDistance] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use tournament hook for database integration (only if tournamentId is provided)
  const { bracket, loading, error, updateMatchWinner } =
    useTournament(tournamentId);

  useEffect(() => {
    if (tournamentId) {
      // Always use database data when tournament ID is provided
      if (bracket.length > 0) {



        // Convert database format to component format
        const formattedMatches = bracket.map((match) => {

          return {
            id: match.match_id,
            tournamentRoundText: match.round_number.toString(),
            roundNumber: match.round_number,
            matchNumber: match.match_number,
            matchType: match.match_type,
            resultText: match.status === 'completed' ?
              (match.match_type === 'bye' ? 'BYE' :
                match.match_type === 'walkover' ? 'W/O' : 'Winner') : '',
            state: match.status === 'completed' ? 'SCORE_DONE' : 'NO_SHOW',
            participants: [
              match.player1 ? {
                id: match.player1.id,
                name: match.player1.name,
                rollNumber: match.player1.roll_number,
                resultText: match.winner_id === match.player1.id ?
                  (match.match_type === 'bye' ? 'BYE' :
                    match.match_type === 'walkover' ? 'W/O' : 'WINNER') : null,
                isWinner: match.winner_id === match.player1.id,
                status: match.match_type === 'bye' ? 'BYE' :
                  match.match_type === 'walkover' ? 'W/O' : match.player1.status,
                seed: match.player1.seed_number
              } : { name: 'TBD', id: null },
              match.player2 ? {
                id: match.player2.id,
                name: match.player2.name,
                rollNumber: match.player2.roll_number,
                resultText: match.winner_id === match.player2.id ?
                  (match.match_type === 'bye' ? 'BYE' :
                    match.match_type === 'walkover' ? 'W/O' : 'WINNER') : null,
                isWinner: match.winner_id === match.player2.id,
                status: match.match_type === 'bye' ? 'BYE' :
                  match.match_type === 'walkover' ? 'W/O' : match.player2.status,
                seed: match.player2.seed_number
              } : { name: 'TBD', id: null }
            ],
            nextMatchId: match.next_match_id,
            position: match.match_position,
          };
        });
        setMatches(formattedMatches);
      } else {
        // Show empty bracket while loading database data
        setMatches([]);
      }
    } else {
      // Fallback to sample data if no tournament ID
      const savedData = localStorage.getItem("acm_tournament_data");

      let needsRegeneration = false;
      if (savedData) {
        try {
          const tournamentData = JSON.parse(savedData);
          const firstRoundMatches = tournamentData.filter(
            (match) => match.tournamentRoundText === "1"
          );
          const totalFirstRoundPlayers = firstRoundMatches.reduce(
            (count, match) => count + match.participants.length,
            0
          );
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

  const handleMatchClick = async (match, x, y) => {
    // Only allow clicking if in editable mode
    if (!isEditable) return;

    const isCurrentlySelected = selectedMatch?.id === match.id;
    setSelectedMatch(isCurrentlySelected ? null : match);

    if (!isCurrentlySelected && match) {
      // Check if this is a BYE situation (one player vs TBD)
      const realPlayers = match.participants.filter(p => p?.name && p.name !== 'TBD');
      const isByeMatch = realPlayers.length === 1;

      // If match is completed, pre-populate form with existing data
      if (match.state === "SCORE_DONE") {
        const winner = match.participants.find((p) => p.isWinner);
        const loser = match.participants.find((p) => !p.isWinner);

        if (winner) {
          setSelectedWinner(winner);

          // Fetch actual scores from database
          try {
            const matchScores = await tournamentAPI.getMatchScores(match.id);
            if (matchScores && matchScores.length > 0) {
              // Find winner and loser scores
              const winnerScore = matchScores.find(s => s.player_id === winner.id);
              const loserScore = matchScores.find(s => s.player_id === loser?.id);

              setWinnerScore(winnerScore?.score?.toString() || '');
              setLoserScore(loserScore?.score?.toString() || '');
            } else {
              // Fallback to empty scores if no data found
              setWinnerScore('');
              setLoserScore('');
            }
          } catch (error) {
            // Fallback to empty scores on error
            setWinnerScore('');
            setLoserScore('');
          }

          setIsWalkover(winner.status === 'walkover' || loser?.status === 'walkover');
          setIsBye(winner.status === 'BYE' || match.matchType === 'bye');
        } else {
          // Reset form for completed match without clear winner
          setSelectedWinner(null);
          setWinnerScore("");
          setLoserScore("");
          setIsWalkover(false);
          setIsBye(false);
        }
      } else {
        // Check for BYE and auto-select the only player
        if (isByeMatch) {
          setSelectedWinner(realPlayers[0]);
          setWinnerScore('');
          setLoserScore('');
          setIsWalkover(false);
          setIsBye(true);
        } else {
          // Reset form for new match selection
          setSelectedWinner(null);
          setWinnerScore('');
          setLoserScore('');
          setIsWalkover(false);
          setIsBye(false);
        }
      }
    } else {
      // Closing modal - reset form
      setSelectedWinner(null);
      setWinnerScore("");
      setLoserScore("");
      setIsWalkover(false);
      setIsBye(false);
    }
  };

  const handleWinnerSelect = async () => {
    if (!selectedWinner) {
      alert("Please select a winner first.");
      return;
    }

    // Add confirmation for editing completed matches
    if (selectedMatch.state === "SCORE_DONE") {
      const confirmed = window.confirm(
        `⚠️ This will update the winner for Round ${selectedMatch.roundNumber}, Match ${selectedMatch.matchNumber}.\n\n` +
        `This may affect subsequent rounds if participants have already advanced.\n\n` +
        `Are you sure you want to continue?`
      );

      if (!confirmed) {
        return;
      }
    }

    // Check if this is a BYE match (opponent is TBD)
    const opponent = selectedMatch.participants.find(p => p.id !== selectedWinner.id);
    const isByeMatch = !opponent || opponent.name === "TBD" || !opponent.id;

    // Validate scores based on match type
    const winnerNum = parseInt(winnerScore) || 0;
    let loserNum = parseInt(loserScore) || 0;

    // For BYE matches, automatically set loser score to 0 (since there's no opponent)
    if (isByeMatch) {
      loserNum = 0;
    }

    // Validate scores based on match type
    if (winnerNum < 0 || loserNum < 0) {
      alert("Scores cannot be negative.");
      return;
    }

    // For regular matches (not walkover, not bye, not BYE match), require valid scores and winner validation
    if (!isWalkover && !isBye && !isByeMatch) {
      if (winnerScore === '' || loserScore === '' || isNaN(winnerNum) || isNaN(loserNum)) {
        alert("Please enter valid numeric scores for regular matches.");
        return;
      }

      // Validate that winner's score is higher than loser's score (only for regular matches)
      if (winnerNum <= loserNum) {
        alert(
          "Winner must have a higher score than the opponent. Please check the scores or use walkover if appropriate."
        );
        return;
      }
    }

    setUpdating(true);

    if (tournamentId && updateMatchWinner) {
      // Update via database
      try {
        const result = await updateMatchWinner(selectedMatch.id, selectedWinner.id, winnerNum, loserNum, isWalkover || isBye);

        // Show success message for completed match updates
        if (selectedMatch.state === "SCORE_DONE") {
          alert(`✅ Match winner and scores updated successfully!\n\nRound ${selectedMatch.roundNumber}, Match ${selectedMatch.matchNumber}\nWinner: ${selectedWinner.name}\nScore: ${winnerNum} - ${loserNum}`);
        }

        // Reset form
        setSelectedMatch(null);
        setSelectedWinner(null);
        setWinnerScore("");
        setLoserScore("");
        setIsWalkover(false);
        setIsBye(false);
      } catch (error) {
        alert(`❌ Failed to update match: ${error.message || 'Unknown error'}\n\nPlease try again.`);
      }
    }

    setUpdating(false);
  };

  const getVisibleMatches = (allMatches) => {
    // Admin view: show everything
    if (isEditable) return allMatches;

    // Apply round filtering if specified
    if (viewMode === 'round' && visibleRounds && visibleRounds.length > 0) {
      return allMatches.filter(match => {
        // Filter matches based on their round number
        return visibleRounds.includes(match.roundNumber);
      });
    }

    // Public view: show complete tournament tree (all rounds and matches)
    // This allows viewers to see the full bracket structure including TBD matches
    return allMatches;
  };

  const visibleMatches = getVisibleMatches(matches);
  const columns = generateColumns(visibleMatches);

  // Create responsive bracket configuration for mobile views while keeping connectors aligned
  const style = React.useMemo(() => {
    const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 375;
    if (isMobile && viewMode === 'round') {
      const mobileGameWidth = Math.min(containerWidth - 20, 350);
      return {
        ...BRACKET_CONFIG,
        gameWidth: mobileGameWidth,
        columnWidth: mobileGameWidth + 10,
        canvasPadding: 5,
      };
    }
    if (isMobile) {
      const responsiveGameWidth = Math.min(containerWidth - 24, BRACKET_CONFIG.gameWidth);
      return {
        ...BRACKET_CONFIG,
        gameWidth: responsiveGameWidth,
        columnWidth: responsiveGameWidth + (BRACKET_CONFIG.columnWidth - BRACKET_CONFIG.gameWidth),
        canvasPadding: 20,
      };
    }
    return BRACKET_CONFIG;
  }, [isMobile, viewMode]);

  if (!columns.length) {
    return (
      <div className="loading h-[100vh] flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white cal-sans-regular">Loading tournament bracket...</p>
        </div>
      </div>
    );
  }

  // Calculate SVG dimensions based on bracket structure
  const svgWidth = columns.length * style.columnWidth + style.canvasPadding * 2;
  let svgHeight = 32 * style.rowHeight + style.canvasPadding * 2; // 32 matches max in first round

  // Dynamic height calculation for round view based on actual matches (both mobile and desktop)
  if (viewMode === 'round') {
    const actualMatchesCount = visibleMatches.length;

    if (isMobile) {
      const roundHeaderHeight = 60;
      const matchHeight = style.gameHeight + 15;
      const extraPadding = actualMatchesCount > 20 ? 60 : 80;
      svgHeight = roundHeaderHeight + (actualMatchesCount * matchHeight) + extraPadding;
    } else {
      // Desktop: Manually set heights for each round type
      if (actualMatchesCount === 16) {
        // Round 2: Reduce height by 25% from Round 1
        const round1Height = 32 * style.rowHeight + style.canvasPadding * 2;
        svgHeight = Math.floor(round1Height * 0.75); // 25% reduction from Round 1
      } else if (actualMatchesCount >= 20) {
        // Round 1: Normal height 
        svgHeight = 32 * style.rowHeight + style.canvasPadding * 2;
      } else if (actualMatchesCount >= 8) {
        // Round 3: Increase height to prevent cutoff
        svgHeight = 1100; // Increased from 800 to show all matches
      } else if (actualMatchesCount >= 4) {
        // Quarter Finals: Moderate height
        svgHeight = 650;
      } else {
        // Finals: Small height
        svgHeight = 450;
      }
    }
  }

  // Zoom/Pan helpers
  const MIN_SCALE = 0.4;
  const MAX_SCALE = 2.5;
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const handleWheel = (e) => {
    if (!containerRef.current) return;

    // Skip zoom for mobile round view - let it behave naturally
    if (isMobile && viewMode === 'round') return;

    // Only zoom when Ctrl key is held, otherwise allow normal scrolling
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY;
      const zoomIntensity = 0.0015;
      const newScale = clamp(
        scale * (1 + delta * zoomIntensity),
        MIN_SCALE,
        MAX_SCALE
      );
      setScale(newScale);
    }
    // For normal scrolling (without Ctrl), let the browser handle it naturally
  };

  // Removed mouse panning - let browser handle all scrolling naturally
  const handleMouseDown = () => { };
  const handleMouseMove = () => { };
  const endPan = () => { };

  const getTouchDistance = (t1, t2) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx, dy);
  };

  const handleTouchStart = (e) => {
    // Skip zoom for mobile round view - let it behave naturally
    if (isMobile && viewMode === 'round') return;

    // Only track pinch gestures, let browser handle single finger naturally
    if (e.touches.length === 2) {
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      setLastPinchDistance(dist);
    }
  };

  const handleTouchMove = (e) => {
    // Skip zoom for mobile round view - let it behave naturally
    if (isMobile && viewMode === 'round') return;

    // Only handle pinch-to-zoom with two fingers
    if (e.touches.length === 2) {
      if (!containerRef.current) return;

      const dist = getTouchDistance(e.touches[0], e.touches[1]);

      if (lastPinchDistance) {
        const factor = dist / lastPinchDistance;
        const newScale = clamp(scale * factor, MIN_SCALE, MAX_SCALE);
        setScale(newScale);
      }
      setLastPinchDistance(dist);
    }
  };

  const handleTouchEnd = () => {
    setLastPinchDistance(null);
  };

  const resetView = () => {
    setScale(1);
    // Let browser handle scrolling naturally - no manual translate needed
  };

  const fitToScreen = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const padding = 20;
    const availableW = Math.max(100, rect.width - padding * 2);
    const availableH = Math.max(100, rect.height - padding * 2);
    const fitScale = clamp(
      Math.min(availableW / svgWidth, availableH / svgHeight),
      MIN_SCALE,
      MAX_SCALE
    );
    setScale(fitScale);
    // Let browser handle scrolling naturally - no manual translate needed
  };

  // Show loading state
  if (tournamentId && loading) {
    return (
      <div className="tournament-bracket">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
            <p className="text-white cal-sans-regular">Loading tournament bracket...</p>
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
          <div className="text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-lg font-medium text-red-400 bodoni-moda">Error loading tournament</p>
            <p className="text-sm mt-2 text-white/70 cal-sans-regular">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tournament-bracket">
      {/* Toolbar: export + cumulative scores */}
      {isEditable && (
        <div className="px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-white font-semibold">Bracket View</div>
          {tournamentId && (
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  const base = process.env.REACT_APP_SUPABASE_URL;
                  const anon = process.env.REACT_APP_SUPABASE_ANON_KEY;
                  if (!base) {
                    alert("Supabase URL not configured");
                    return;
                  }
                  setIsExporting(true);
                  try {
                    const url = `${base}/functions/v1/export_excel?tournamentId=${tournamentId}`;
                    const resp = await fetch(url, {
                      method: "GET",
                      headers: anon
                        ? { Authorization: `Bearer ${anon}` }
                        : undefined,
                    });
                    if (!resp.ok) {
                      const text = await resp.text();
                      throw new Error(text || "Export failed");
                    }
                    const blob = await resp.blob();
                    const dlUrl = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = dlUrl;
                    const filename = `tournament_${tournamentId}_report.xlsx`;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(dlUrl);
                  } catch (e) {
                    alert(e.message || "Failed to generate Excel");
                  } finally {
                    setIsExporting(false);
                  }
                }}
                disabled={isExporting}
                className={`px-4 py-2 rounded-lg text-white font-bold shadow inline-flex items-center gap-2 border ${isExporting
                  ? "bg-amber-700/60 border-amber-600/50 cursor-wait"
                  : "bg-amber-800/60 hover:bg-amber-700/70 border-amber-600/60 hover:border-amber-500/70"
                  }`}
              >
                {isExporting ? "Generating…" : "Export Excel"}
              </button>
              <button
                onClick={async () => {
                  try {
                    const data = await tournamentAPI.getCumulativeScores(
                      tournamentId
                    );
                    setCumulativeScores(Array.isArray(data) ? data : []);
                    setShowScores(true);
                  } catch (e) {
                    alert(`Failed to load scores: ${e.message || e}`);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-amber-800/60 hover:bg-amber-700/70 border border-amber-600/60 hover:border-amber-500/70 text-white font-bold shadow"
              >
                Cumulative Scores
              </button>
            </div>
          )}
        </div>
      )}
      <div
        ref={containerRef}
        className={`bracket-scrollable-container ${isMobile && viewMode === 'round' ? 'bracket-round-view' : ''}`}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bracket-content">
          <svg
            className="bracket-svg"
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          >
            <g
              transform={isMobile && viewMode === 'round' ? 'scale(1)' : `scale(${scale})`}
            >
              {columns.map((matchesColumn, columnIndex) =>
                matchesColumn.map((match, rowIndex) => {
                  const { x, y } = calculatePositionOfMatch(
                    rowIndex,
                    columnIndex,
                    style
                  );
                  const { previousTopMatch, previousBottomMatch } =
                    getPreviousMatches(columnIndex, columns, rowIndex, match);

                  return (
                    <g key={`${columnIndex}-${rowIndex}-${match.id}`} className="scale-95">
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
                              {match.tournamentRoundText === "6"
                                ? "Finals"
                                : match.tournamentRoundText === "5"
                                  ? "Semi Finals"
                                  : match.tournamentRoundText === "4"
                                    ? "Quarter Finals"
                                    : match.tournamentRoundText === "3"
                                      ? "Round 3"
                                      : match.tournamentRoundText === "2"
                                        ? "Round 2"
                                        : match.tournamentRoundText === "1"
                                          ? "Round 1"
                                          : `Round ${match.tournamentRoundText}`}
                            </h3>
                          </div>
                        </foreignObject>
                      )}

                      {/* Connector lines */}
                      {columnIndex !== 0 &&
                        previousTopMatch &&
                        previousBottomMatch && (
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
                          onMatchClick={async () => handleMatchClick(match, x, y)}
                          isSelected={selectedMatch?.id === match.id}
                          gameWidth={style.gameWidth}
                          gameHeight={style.gameHeight}
                        />
                      </foreignObject>
                    </g>
                  );
                })
              )}
            </g>
          </svg>
        </div>
      </div>

      {/* Enhanced Winner selection modal with score inputs - show in editable mode for all matches */}
      {isEditable && selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 transform transition-all">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">
                {selectedMatch.state === "SCORE_DONE"
                  ? "🔄 Edit Winner"
                  : "🏆 Set Winner"}
              </h3>
              <p className="text-sm text-white/70">
                Match {selectedMatch.matchNumber} - Round{" "}
                {selectedMatch.roundNumber}
                {selectedMatch.state === "SCORE_DONE" && (
                  <span className="block text-orange-400 font-medium mt-1">
                    ⚠️ Editing completed match
                  </span>
                )}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-white mb-3">
                Select the winner:
              </p>
              <div className="space-y-3">
                {selectedMatch.participants
                  .filter((p) => p?.name && p.name !== "TBD")
                  .map((participant) => (
                    <button
                      key={participant.id}
                      onClick={() => setSelectedWinner(participant)}
                      disabled={updating}
                      className={`w-full p-4 text-left border rounded-lg backdrop-blur-xl transition-all duration-200 ${selectedWinner?.id === participant.id
                        ? "border-orange-400/40 bg-orange-500/10"
                        : "border-white/10 bg-white/5 hover:border-orange-400/20 hover:bg-orange-500/5"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {participant.seed && (
                            <span className="inline-flex items-center justify-center w-7 h-7 bg-orange-500/15 backdrop-blur-md border border-orange-400/30 text-orange-200 text-sm font-bold rounded-full mr-3">
                              {participant.seed}
                            </span>
                          )}
                          <div>
                            <span className="font-semibold text-white block">
                              {participant.name}
                            </span>
                            <span className="text-sm text-white/70">
                              {participant.rollNumber}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`transition-colors ${selectedWinner?.id === participant.id
                            ? "text-orange-400"
                            : "text-orange-300"
                            }`}
                        >
                          {selectedWinner?.id === participant.id ? "✓" : "👑"}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            <div className="mb-6 space-y-3">
              <label className="flex items-center p-3 bg-white/5 backdrop-blur-xl rounded-lg border border-white/10">
                <input
                  type="checkbox"
                  checked={isWalkover}
                  onChange={(e) => {
                    setIsWalkover(e.target.checked);
                    if (e.target.checked) setIsBye(false); // Can't be both walkover and bye
                  }}
                  className="mr-3 w-4 h-4 text-orange-500 border-white/30 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-white">
                  Walkover (opponent unable to compete)
                </span>
              </label>

              <label className="flex items-center p-3 bg-white/5 backdrop-blur-xl rounded-lg border border-white/10">
                <input
                  type="checkbox"
                  checked={isBye}
                  onChange={(e) => {
                    setIsBye(e.target.checked);
                    if (e.target.checked) setIsWalkover(false); // Can't be both walkover and bye
                  }}
                  className="mr-3 w-4 h-4 text-orange-500 border-white/30 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-white">BYE (opponent absent)</span>
              </label>
            </div>

            {selectedWinner && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-white mb-3">
                  Match Scores:
                  {(isWalkover || isBye) && (
                    <span className="text-xs text-white/60 ml-2">
                      (Enter attempted score if applicable)
                    </span>
                  )}
                </h4>
                {(() => {
                  const opponent = selectedMatch.participants.find(
                    (p) => p.id !== selectedWinner.id
                  );
                  const isByeMatch = !opponent || opponent.name === "TBD" || !opponent.id;

                  if (isByeMatch) {
                    // Only show winner's score for BYE matches
                    return (
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            {selectedWinner.name} (Winner - BYE)
                          </label>
                          <input
                            type="text"
                            value={winnerScore}
                            onChange={(e) => setWinnerScore(e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-2 text-white bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors placeholder-white/40"
                          />
                        </div>
                      </div>
                    );
                  } else {
                    // Show both scores for regular matches
                    return (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            {selectedWinner.name} (Winner)
                          </label>
                          <input
                            type="text"
                            value={winnerScore}
                            onChange={(e) => setWinnerScore(e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-2 text-white bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors placeholder-white/40"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            {opponent.name}
                          </label>
                          <input
                            type="text"
                            value={loserScore}
                            onChange={(e) => setLoserScore(e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-2 text-white bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors placeholder-white/40"
                          />
                        </div>
                      </div>
                    );
                  }
                })()}
                {selectedMatch.state === "SCORE_DONE" && (
                  <p className="text-xs text-orange-400 mt-2">
                    💡 Editing completed match: Update as
                    needed.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedMatch(null);
                  setSelectedWinner(null);
                  setWinnerScore("");
                  setLoserScore("");
                  setIsWalkover(false);
                  setIsBye(false);
                }}
                disabled={updating}
                className="px-6 py-2 text-white/70 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-50 transition-colors font-medium"
              >
                Cancel
              </button>
              {selectedWinner && (
                <button
                  onClick={handleWinnerSelect}
                  disabled={updating}
                  className="px-6 py-2 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-400/30 text-orange-100 backdrop-blur-xl rounded-lg disabled:opacity-50 transition-colors font-medium"
                >
                  {updating
                    ? "Updating..."
                    : selectedMatch.state === "SCORE_DONE"
                      ? "Update Winner"
                      : "Confirm Winner"}
                </button>
              )}
            </div>

            {updating && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-sm text-white/70 mt-2">Updating match...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cumulative Scores Modal */}
      {showScores && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#120d0a] rounded-xl shadow-2xl p-6 w-full max-w-3xl mx-4 text-orange-200">
            <div className="flex items-center justify-between mb-4 text-orange-500">
              <h3 className="text-lg font-bold">
                Cumulative Scores
              </h3>
              <button
                onClick={() => setShowScores(false)}
                className="px-3 py-1 rounded bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/30 text-orange-200 hover:text-orange-100"
              >
                Close
              </button>
            </div>
            <div className="overflow-auto max-h-[60vh]">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b text-orange-300">
                    <th className="py-2 pr-4">Roll No</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Total Points</th>
                    <th className="py-2 pr-4">Wins</th>
                    <th className="py-2 pr-4">Losses</th>
                  </tr>
                </thead>
                <tbody>
                  {cumulativeScores.map((r) => (
                    <tr
                      key={r.player_id}
                      className="border-b last:border-0"
                    >
                      <td className="py-2 pr-4">{r.roll_number}</td>
                      <td className="py-2 pr-4">{r.player_name}</td>
                      <td className="py-2 pr-4">{r.total_points}</td>
                      <td className="py-2 pr-4">{r.wins}</td>
                      <td className="py-2 pr-4">{r.losses}</td>
                    </tr>
                  ))}
                  {cumulativeScores.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-gray-500"
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentBracketViewFinal;
