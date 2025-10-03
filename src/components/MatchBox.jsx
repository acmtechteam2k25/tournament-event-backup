import React from 'react';

const MatchBox = ({ match, onMatchClick, isSelected, gameWidth, gameHeight }) => {
  // Convert round number to display format (same as bracket buttons)
  const getRoundDisplayName = (roundNumber) => {
    switch (roundNumber) {
      case 1: return 'R1';
      case 2: return 'R2';
      case 3: return 'R3';
      case 4: return 'QF'; // Quarter Finals
      case 5: return 'SF'; // Semi Finals
      case 6: return 'F';  // Finals
      default: return `R${roundNumber}`;
    }
  };
  const handleMatchClick = () => {
    onMatchClick();
  };

  return (
    <div 
      className={`svg-match ${isSelected ? 'selected' : ''}`}
      onClick={handleMatchClick}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        cursor: 'pointer',
        pointerEvents: 'all'
      }}
    >
      <div className="match-header">
        <span className="match-identifier">
          {match.roundNumber && match.matchNumber ? `${getRoundDisplayName(match.roundNumber)}/M${match.matchNumber}` : match.name}
        </span>
        <div className={`match-status ${match.state === 'SCORE_DONE' ? 'done' : 'scheduled'}`}>
          {match.state === 'SCORE_DONE' ? '✓' : '○'}
        </div>
      </div>
      
      <div className="match-participants">
        {/* Always show exactly 2 participant slots */}
        {[0, 1].map((slotIndex) => {
          const participant = match.participants[slotIndex];
          return (
            <div 
              key={participant?.id || `tbd-${slotIndex}`}
              className={`participant ${participant?.isWinner ? 'winner' : ''} ${participant?.status === 'WALKOVER' ? 'walkover' : ''} ${!participant ? 'tbd' : ''}`}
            >
              <div className="participant-info">
                {participant?.seed && (
                  <span className="player-seed">
                    {participant.seed}
                  </span>
                )}
                <span className="participant-name">
                  {participant?.name || 'TBD'}
                </span>
                {participant?.rollNumber && (
                  <span className="player-roll">
                    {participant.rollNumber}
                  </span>
                )}
              </div>
              {participant?.resultText && (
                <span className="participant-result">{participant.resultText}</span>
              )}
              {participant?.status === 'WALKOVER' && (
                <span className="walkover-indicator">W/O</span>
              )}
              {participant?.status === 'BYE' && (
                <span className="bye-indicator">BYE</span>
              )}
            </div>
          );
        })}
      </div>
      

    </div>
  );
};

export default MatchBox;