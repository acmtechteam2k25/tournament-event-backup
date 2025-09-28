import React from 'react';

const MatchBox = ({ match, onMatchClick, isSelected, gameWidth, gameHeight }) => {
  const handleMatchClick = () => {
    console.log('Match clicked:', match.name);
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
        <span className="match-name">{match.name}</span>
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
              <span className="participant-name">
                {participant?.name || 'TBD'}
              </span>
              {participant?.resultText && (
                <span className="participant-result">{participant.resultText}</span>
              )}
              {participant?.status === 'WALKOVER' && (
                <span className="walkover-indicator">W/O</span>
              )}
            </div>
          );
        })}
      </div>
      

    </div>
  );
};

export default MatchBox;