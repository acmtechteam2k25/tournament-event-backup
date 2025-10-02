import React, { useState } from 'react';
import { config } from '../config';
import TournamentBracketViewClean from '../components/TournamentBracketViewClean';
import './BracketViewPage.css';

const BracketViewPage = () => {
  const [tournamentKey, setTournamentKey] = useState(config.DEFAULT_TOURNAMENT_KEY);
  const [viewMode, setViewMode] = useState('full'); // 'full' or 'round'
  const [selectedRound, setSelectedRound] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const tournamentId = config.TOURNAMENTS?.[tournamentKey]?.id || config.TOURNAMENT_ID;

  // Handle window resize for mobile detection
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Available rounds (assuming max 6 rounds for tournament)
  const maxRounds = 6;
  const availableRounds = Array.from({ length: maxRounds }, (_, i) => i + 1);

  // Calculate visible rounds based on selection
  const getVisibleRounds = () => {
    if (viewMode === 'full') return availableRounds;
    
    if (isMobile) {
      // Mobile: show only selected round
      return [selectedRound];
    } else {
      // Desktop: show selected round + next 2 rounds
      const rounds = [];
      for (let i = 0; i < 3; i++) {
        const round = selectedRound + i;
        if (round <= maxRounds) {
          rounds.push(round);
        }
      }
      return rounds;
    }
  };

  return (
    <div className="min-h-screen bg-black px-2 sm:px-4 pb-6">
      {/* Tournament Selection Buttons - positioned below navbar */}
      <div className="pt-20 pb-4 flex justify-center">
        <div className="flex gap-2">
          <button
            onClick={() => setTournamentKey('secondYear')}
            className={`px-4 py-2 rounded-l backdrop-blur-md border transition-all duration-200 ${tournamentKey === 'secondYear' ? 'bg-black/20 text-orange-200 border-orange-400/60' : 'bg-black/10 text-white/70 border-white/20 hover:bg-black/20 hover:text-orange-200 hover:border-orange-400/30'}`}
          >
            2nd Year
          </button>
          <button
            onClick={() => setTournamentKey('thirdYear')}
            className={`px-4 py-2 rounded-r backdrop-blur-md border transition-all duration-200 ${tournamentKey === 'thirdYear' ? 'bg-black/20 text-orange-200 border-orange-400/60' : 'bg-black/10 text-white/70 border-white/20 hover:bg-black/20 hover:text-orange-200 hover:border-orange-400/30'}`}
          >
            3rd Year
          </button>
        </div>
      </div>

      {/* View Mode Controls */}
      <div className="pb-4 flex flex-col items-center gap-4">
        {/* Full vs Round View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('full')}
            className={`px-4 py-2 rounded-l backdrop-blur-md border transition-all duration-200 ${viewMode === 'full' ? 'bg-orange-500/20 text-orange-200 border-orange-400/60' : 'bg-black/10 text-white/70 border-white/20 hover:bg-orange-500/10 hover:text-orange-200 hover:border-orange-400/30'}`}
          >
            Full Bracket
          </button>
          <button
            onClick={() => setViewMode('round')}
            className={`px-4 py-2 rounded-r backdrop-blur-md border transition-all duration-200 ${viewMode === 'round' ? 'bg-orange-500/20 text-orange-200 border-orange-400/60' : 'bg-black/10 text-white/70 border-white/20 hover:bg-orange-500/10 hover:text-orange-200 hover:border-orange-400/30'}`}
          >
            Round View
          </button>
        </div>

        {/* Round Selection (only show when round view is active) */}
        {viewMode === 'round' && (
          <div className="flex flex-col items-center gap-3">
            <span className="text-white/70 text-sm">
              {isMobile ? 'Select Round:' : 'Starting Round:'}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {availableRounds.map((round) => (
                <button
                  key={round}
                  onClick={() => setSelectedRound(round)}
                  className={`px-4 py-2 rounded backdrop-blur-md border transition-all duration-200 text-sm min-w-[60px] ${selectedRound === round ? 'bg-orange-500/20 text-orange-200 border-orange-400/60' : 'bg-black/10 text-white/70 border-white/20 hover:bg-orange-500/10 hover:text-orange-200 hover:border-orange-400/30'}`}
                >
                  R{round}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Bracket Component - Read-only bracket viewer */}
      <div className="max-w-[95%] sm:max-w-[90%] mx-auto bg-[#140f0b] rounded-lg border border-white/10 overflow-hidden shadow-xl">
        <div className="bracket-component">
          <TournamentBracketViewClean 
            isEditable={false} 
            tournamentId={tournamentId}
            viewMode={viewMode}
            visibleRounds={viewMode === 'round' ? getVisibleRounds() : null}
          />
        </div>
      </div>
    </div>
  );
};

export default BracketViewPage;