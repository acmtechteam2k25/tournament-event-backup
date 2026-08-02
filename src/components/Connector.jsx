import React from 'react';
import { calculateVerticalPositioning } from '../utils/bracketPositioning';

// Professional connector component with proper spacing
const Connector = ({
  bracketSnippet,
  rowIndex,
  columnIndex,
  gameHeight,
  gameWidth,
  style
}) => {
  if (!bracketSnippet.previousTopMatch || !bracketSnippet.previousBottomMatch) {
    return null;
  }

  const { canvasPadding, columnWidth, rowHeight } = style;

  const currentMatchX = columnIndex * columnWidth + canvasPadding;
  const currentMatchY = calculateVerticalPositioning({ rowHeight, rowIndex, columnIndex }) + canvasPadding;

  const prevColumnIndex = columnIndex - 1;
  const topMatchY = calculateVerticalPositioning({
    rowHeight,
    rowIndex: rowIndex * 2,
    columnIndex: prevColumnIndex
  }) + canvasPadding;

  const bottomMatchY = calculateVerticalPositioning({
    rowHeight,
    rowIndex: rowIndex * 2 + 1,
    columnIndex: prevColumnIndex
  }) + canvasPadding;

  const prevMatchX = prevColumnIndex * columnWidth + canvasPadding + gameWidth;
  const horizontalLineY = currentMatchY + gameHeight / 2;
  const verticalLineX = currentMatchX - 40; // Better spacing from larger match box

  return (
    <g>
      {/* Horizontal line from top previous match */}
      <line
        x1={prevMatchX}
        y1={topMatchY + gameHeight / 2}
        x2={verticalLineX}
        y2={topMatchY + gameHeight / 2}
        stroke="#0d9c57"
        strokeWidth="2"
        opacity="0.8"
      />

      {/* Horizontal line from bottom previous match */}
      <line
        x1={prevMatchX}
        y1={bottomMatchY + gameHeight / 2}
        x2={verticalLineX}
        y2={bottomMatchY + gameHeight / 2}
        stroke="#0d9c57"
        strokeWidth="2"
        opacity="0.8"
      />

      {/* Vertical connector line */}
      <line
        x1={verticalLineX}
        y1={topMatchY + gameHeight / 2}
        x2={verticalLineX}
        y2={bottomMatchY + gameHeight / 2}
        stroke="#0d9c57"
        strokeWidth="2"
        opacity="0.8"
      />

      {/* Horizontal line to current match */}
      <line
        x1={verticalLineX}
        y1={horizontalLineY}
        x2={currentMatchX}
        y2={horizontalLineY}
        stroke="#0d9c57"
        strokeWidth="2"
        opacity="0.8"
      />
    </g>
  );
};

export default Connector;