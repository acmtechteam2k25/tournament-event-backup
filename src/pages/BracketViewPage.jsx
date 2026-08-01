import React, { useState } from 'react';
import { config } from '../config';
import TournamentBracketViewClean from '../components/TournamentBracketViewClean';
import ConfettiCelebration from '../components/ConfettiCelebration';
import './BracketViewPage.css';

const BracketViewPage = () => {
  const [tournamentKey, setTournamentKey] = useState(config.DEFAULT_TOURNAMENT_KEY);
  const [viewMode, setViewMode] = useState('full'); // 'full' or 'round'
  const [selectedRound, setSelectedRound] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showConfetti, setShowConfetti] = useState(false);

  const tournamentId = config.TOURNAMENTS?.[tournamentKey]?.id || config.TOURNAMENT_ID;

  // Handle window resize for mobile detection
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 6-round button list: R1 R2 R3 QF SF F
  const maxRounds = config.TOURNAMENTS?.[tournamentKey]?.numRounds || config.NUM_ROUNDS || 6;
  const availableRounds = [1, 2, 3, 4, 5, 6].filter(r => r <= maxRounds);

  const getRoundDisplayName = (roundNumber) => {
    switch (roundNumber) {
      case 1: return 'R1';
      case 2: return 'R2';
      case 3: return 'R3';
      case 4: return 'QF';
      case 5: return 'SF';
      case 6: return 'F';
      default: return `R${roundNumber}`;
    }
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
      {/* Confetti Animation */}
      <ConfettiCelebration
        isActive={showConfetti}
        onComplete={() => setShowConfetti(false)}
        duration={5000}
      />

      {/* Tournament Selection Buttons — switch the displayed bracket, no modal */}
      <div className="pt-20 pb-4 flex justify-center">
        <div className="flex gap-2">
          <button
            onClick={() => setTournamentKey('secondYear')}
            className={`cal-sans-regular px-4 py-2 rounded-l backdrop-blur-md border transition-all duration-200 ${tournamentKey === 'secondYear' ? 'bg-black/20 text-orange-200 border-orange-400/60' : 'bg-black/10 text-white/70 border-white/20 hover:bg-black/20 hover:text-orange-200 hover:border-orange-400/30'}`}
          >
            2nd Year
          </button>
          <button
            onClick={() => setTournamentKey('thirdYear')}
            className={`cal-sans-regular px-4 py-2 rounded-r backdrop-blur-md border transition-all duration-200 ${tournamentKey === 'thirdYear' ? 'bg-black/20 text-orange-200 border-orange-400/60' : 'bg-black/10 text-white/70 border-white/20 hover:bg-black/20 hover:text-orange-200 hover:border-orange-400/30'}`}
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
            className={`cal-sans-regular px-4 py-2 rounded-l backdrop-blur-md border transition-all duration-200 ${viewMode === 'full' ? 'bg-orange-500/20 text-orange-200 border-orange-400/60' : 'bg-black/10 text-white/70 border-white/20 hover:bg-orange-500/10 hover:text-orange-200 hover:border-orange-400/30'}`}
          >
            Full Bracket
          </button>
          <button
            onClick={() => setViewMode('round')}
            className={`cal-sans-regular px-4 py-2 backdrop-blur-md border transition-all duration-200 ${viewMode === 'round' ? 'bg-orange-500/20 text-orange-200 border-orange-400/60' : 'bg-black/10 text-white/70 border-white/20 hover:bg-orange-500/10 hover:text-orange-200 hover:border-orange-400/30'}`}
          >
            Round View
          </button>
          <button
            onClick={() => setShowConfetti(true)}
            className="cal-sans-regular px-4 py-2 rounded-r backdrop-blur-md border border-amber-400/60 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-200 hover:from-amber-500/30 hover:to-orange-500/30 transition-all duration-200 transform hover:scale-105"
            title="Celebrate! 🎉"
          >
            🎉 Celebrate
          </button>
        </div>

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
                  {getRoundDisplayName(round)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bracket — verification modal is handled inside TournamentBracketViewClean for public view */}
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
