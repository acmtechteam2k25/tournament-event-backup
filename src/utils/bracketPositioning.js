// Tournament bracket positioning calculations (g-loot style)

export const calculateVerticalPositioning = ({ rowHeight, rowIndex, columnIndex }) => {
  const heightIncrease = Math.pow(2, columnIndex);
  const verticalStartingPoint = (rowHeight * heightIncrease) / 2;
  return rowIndex * rowHeight * heightIncrease + verticalStartingPoint;
};

export const calculatePositionOfMatch = (rowIndex, columnIndex, { canvasPadding, columnWidth, rowHeight }) => {
  const yResult = calculateVerticalPositioning({ rowHeight, rowIndex, columnIndex });
  return {
    x: columnIndex * columnWidth + canvasPadding,
    y: yResult + canvasPadding,
  };
};

// Generate g-loot style columns - organize matches by round
export const generateColumns = (matches) => {
  if (!matches.length) return [];
  
  const columns = [];
  
  // Round 1: Matches 1-32
  const round1 = matches.filter(m => m.tournamentRoundText === '1');
  if (round1.length) columns.push(round1);
  
  // Round 2: Matches 33-48
  const round2 = matches.filter(m => m.tournamentRoundText === '2');
  if (round2.length) columns.push(round2);
  
  // Round 3: Matches 49-56
  const round3 = matches.filter(m => m.tournamentRoundText === '3');
  if (round3.length) columns.push(round3);
  
  // Round 4: Matches 57-60
  const round4 = matches.filter(m => m.tournamentRoundText === '4');
  if (round4.length) columns.push(round4);
  
  // Round 5: Matches 61-62
  const round5 = matches.filter(m => m.tournamentRoundText === '5');
  if (round5.length) columns.push(round5);
  
  // Round 6: Match 63 (Final)
  const round6 = matches.filter(m => m.tournamentRoundText === '6');
  if (round6.length) columns.push(round6);
  
  return columns;
};

// Helper function to get previous matches for connector lines
export const getPreviousMatches = (columnIndex, columns, rowIndex, currentMatch) => {
  if (columnIndex === 0) {
    return { previousTopMatch: null, previousBottomMatch: null };
  }
  
  const previousColumn = columns[columnIndex - 1];
  if (!previousColumn) {
    return { previousTopMatch: null, previousBottomMatch: null };
  }
  
  // Find matches that connect to current match
  const connectingMatches = previousColumn.filter(match => match.nextMatchId === currentMatch.id);
  
  if (connectingMatches.length >= 2) {
    return { 
      previousTopMatch: connectingMatches[0], 
      previousBottomMatch: connectingMatches[1] 
    };
  }
  
  return { previousTopMatch: null, previousBottomMatch: null };
};

// Tournament bracket configuration
export const BRACKET_CONFIG = {
  rowHeight: 120,
  columnWidth: 450,
  canvasPadding: 40,
  gameHeight: 110,
  gameWidth: 400,
};