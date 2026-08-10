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
  
  // Group matches by round number dynamically — works for any bracket size
  const roundNumbers = [...new Set(matches.map(m => parseInt(m.tournamentRoundText, 10)))]
    .sort((a, b) => a - b);

  roundNumbers.forEach(rn => {
    const roundMatches = matches.filter(m => m.tournamentRoundText === String(rn));
    if (roundMatches.length) columns.push(roundMatches);
  });
  
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