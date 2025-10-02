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
          className={`px-3 py-1 rounded-l border ${tournamentKey === 'secondYear' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
        >
          2nd Year
        </button>
        <button
          onClick={() => setTournamentKey('thirdYear')}
          className={`px-3 py-1 rounded-r border-t border-b border-r ${tournamentKey === 'thirdYear' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
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