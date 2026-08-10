import React, { useState } from 'react';
import { config } from '../config';
import TournamentBracketViewClean from '../components/TournamentBracketViewClean';
import './BracketViewPage.css';

const BracketViewPage = () => {
  const [tournamentKey, setTournamentKey] = useState(config.DEFAULT_TOURNAMENT_KEY);
  const [viewMode, setViewMode] = useState('full');
  const [selectedRound, setSelectedRound] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const tournamentId = config.TOURNAMENTS?.[tournamentKey]?.id || config.TOURNAMENT_ID;

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxRounds = config.TOURNAMENTS?.[tournamentKey]?.numRounds || config.NUM_ROUNDS || 4;
  const availableRounds = Array.from({ length: maxRounds }, (_, i) => i + 1);

  const getRoundDisplayName = (roundNumber) => {
    if (roundNumber === maxRounds) return 'F';
    if (roundNumber === maxRounds - 1) return 'SF';
    return `R${roundNumber}`;
  };

  const getVisibleRounds = () => {
    if (viewMode === 'full') return availableRounds;
    if (isMobile) return [selectedRound];
    const rounds = [];
    for (let i = 0; i < 3; i++) {
      const round = selectedRound + i;
      if (round <= maxRounds) rounds.push(round);
    }
    return rounds;
  };

  return (
    <div className="min-h-screen bg-black px-2 sm:px-4 pb-6">

      {/* Tournament Selection Buttons */}
      <div className="pt-20 pb-4 flex justify-center">
        <div className="flex gap-2">
          <button
            onClick={() => setTournamentKey('secondYear')}
            className={`tektur-title px-5 py-2 rounded-l backdrop-blur-md border transition-all duration-200 text-sm font-semibold ${
              tournamentKey === 'secondYear'
                ? 'bg-[#024028] text-white border-[#0d9c57] shadow-[0_0_14px_rgba(13,156,87,0.45)]'
                : 'bg-black/10 text-white/60 border-white/15 hover:bg-[#024028]/60 hover:text-white hover:border-[#0d9c57]/50'
            }`}
          >
            2nd Year
          </button>
          <button
            onClick={() => setTournamentKey('thirdYear')}
            className={`tektur-title px-5 py-2 rounded-r backdrop-blur-md border transition-all duration-200 text-sm font-semibold ${
              tournamentKey === 'thirdYear'
                ? 'bg-[#024028] text-white border-[#0d9c57] shadow-[0_0_14px_rgba(13,156,87,0.45)]'
                : 'bg-black/10 text-white/60 border-white/15 hover:bg-[#024028]/60 hover:text-white hover:border-[#0d9c57]/50'
            }`}
          >
            3rd Year
          </button>
        </div>
      </div>

      {/* View Mode Controls */}
      <div className="pb-4 flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('full')}
            className={`tektur-title px-5 py-2 rounded-l backdrop-blur-md border transition-all duration-200 text-sm font-semibold ${
              viewMode === 'full'
                ? 'bg-[#024028] text-white border-[#0d9c57] shadow-[0_0_14px_rgba(13,156,87,0.45)]'
                : 'bg-black/10 text-white/60 border-white/15 hover:bg-[#024028]/60 hover:text-white hover:border-[#0d9c57]/50'
            }`}
          >
            Full Bracket
          </button>
          <button
            onClick={() => setViewMode('round')}
            className={`tektur-title px-5 py-2 rounded-r backdrop-blur-md border transition-all duration-200 text-sm font-semibold ${
              viewMode === 'round'
                ? 'bg-[#024028] text-white border-[#0d9c57] shadow-[0_0_14px_rgba(13,156,87,0.45)]'
                : 'bg-black/10 text-white/60 border-white/15 hover:bg-[#024028]/60 hover:text-white hover:border-[#0d9c57]/50'
            }`}
          >
            Round View
          </button>
          {/* Celebrate button removed per request */}
        </div>

        {viewMode === 'round' && (
          <div className="flex flex-col items-center gap-3">
            <span className="text-white/60 text-sm tektur-title">
              {isMobile ? 'Select Round:' : 'Starting Round:'}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {availableRounds.map((round) => (
                <button
                  key={round}
                  onClick={() => setSelectedRound(round)}
                  className={`tektur-title px-4 py-2 rounded backdrop-blur-md border transition-all duration-200 text-sm min-w-[60px] font-semibold ${
                    selectedRound === round
                      ? 'bg-[#024028] text-white border-[#0d9c57] shadow-[0_0_12px_rgba(13,156,87,0.4)]'
                      : 'bg-black/10 text-white/60 border-white/15 hover:bg-[#024028]/60 hover:text-white hover:border-[#0d9c57]/50'
                  }`}
                >
                  {getRoundDisplayName(round)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bracket */}
      <div className="max-w-[95%] sm:max-w-[90%] mx-auto bg-black rounded-lg border border-[#0d9c57]/20 overflow-hidden shadow-xl shadow-[#0d9c57]/5">
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
