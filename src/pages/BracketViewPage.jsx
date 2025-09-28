import React from 'react';
import TournamentBracketViewClean from '../components/TournamentBracketViewClean';
import './BracketViewPage.css';

const BracketViewPage = () => {
  return (
    <div className="bracket-view-page">
      <div className="public-bracket-content">
        <TournamentBracketViewClean isEditable={false} />
      </div>
    </div>
  );
};

export default BracketViewPage;