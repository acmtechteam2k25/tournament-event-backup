import React from 'react';
import { config } from '../config';
import TournamentBracketViewClean from '../components/TournamentBracketViewClean';
import './BracketViewPage.css';

const BracketViewPage = () => {
  // Use the fixed tournament ID from config
  const tournamentId = config.TOURNAMENT_ID;

  return (
    <div className="bracket-view-page">
      <div className="public-bracket-content">
        <TournamentBracketViewClean isEditable={false} tournamentId={tournamentId} />
      </div>
    </div>
  );
};

export default BracketViewPage;