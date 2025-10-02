import React, { useState } from 'react';
import { config } from '../config';
import TournamentBracketViewClean from '../components/TournamentBracketViewClean';
import './BracketViewPage.css';

const BracketViewPage = () => {
  const [tournamentKey, setTournamentKey] = useState(config.DEFAULT_TOURNAMENT_KEY);
  const tournamentId = config.TOURNAMENTS?.[tournamentKey]?.id || config.TOURNAMENT_ID;

  return (
    <div className="bracket-view-page pt-40">
      <div className="px-4 py-6 flex items-center justify-start gap-2">
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
      <div className="public-bracket-content">
        <TournamentBracketViewClean isEditable={false} tournamentId={tournamentId} />
      </div>
    </div>
  );
};

export default BracketViewPage;