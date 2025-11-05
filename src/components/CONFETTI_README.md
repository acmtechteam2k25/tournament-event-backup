# 🎉 Confetti Celebration Component

A beautiful, full-page confetti animation component with optional sound effects for React applications.

## Features

- ✨ **Full-page animated confetti** with 150+ pieces
- 🎨 **8 vibrant colors** (Gold, Pink, Cyan, Purple, Orange, Green, Red, Yellow)
- 🔊 **Optional celebration sound** (plays automatically when triggered)
- 🎭 **Multiple shapes** (circles and squares) with rotation effects
- 🌊 **Physics-based motion** (gravity, bouncing, fading)
- ⚡ **Responsive** and performant using Canvas API
- 🎮 **Easy to integrate** with any React component

## Installation

No additional dependencies required! Just copy the component files to your project.

## Usage

### Basic Example

\`\`\`jsx
import React, { useState } from 'react';
import ConfettiCelebration from './components/ConfettiCelebration';

function App() {
  const [showConfetti, setShowConfetti] = useState(false);

  return (
    <div>
      <ConfettiCelebration 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)}
        duration={5000}
      />
      
      <button onClick={() => setShowConfetti(true)}>
        🎉 Celebrate!
      </button>
    </div>
  );
}
\`\`\`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isActive` | boolean | required | Controls when the confetti animation starts |
| `onComplete` | function | optional | Callback function called when animation completes |
| `duration` | number | 5000 | Animation duration in milliseconds |

## Adding Custom Sound

To add your own celebration sound:

1. Add an audio file to your `public` folder (e.g., `public/sounds/celebration.mp3`)
2. Update the `<audio>` element in `ConfettiCelebration.jsx`:

\`\`\`jsx
<audio ref={audioRef} preload="auto">
  <source src="/sounds/celebration.mp3" type="audio/mpeg" />
  <source src="/sounds/celebration.ogg" type="audio/ogg" />
</audio>
\`\`\`

### Recommended Sound Files

- **Format**: MP3 or OGG
- **Duration**: 2-5 seconds
- **Volume**: Pre-normalized to avoid being too loud
- **Free sources**:
  - [Freesound.org](https://freesound.org/)
  - [Zapsplat](https://www.zapsplat.com/)
  - [Mixkit](https://mixkit.co/free-sound-effects/)

## Customization

### Change Number of Confetti Pieces

Edit line 103 in `ConfettiCelebration.jsx`:

\`\`\`javascript
const numPieces = 150; // Change this number
\`\`\`

### Change Colors

Edit the `getRandomColor()` method (lines 45-58):

\`\`\`javascript
const colors = [
  '#YOUR_COLOR_1',
  '#YOUR_COLOR_2',
  // Add more colors...
];
\`\`\`

### Adjust Physics

Modify the confetti behavior in the `update()` method:

\`\`\`javascript
this.speedY += 0.1;  // Gravity (higher = falls faster)
this.speedX *= -1;   // Bounce behavior
this.opacity -= 0.02; // Fade speed
\`\`\`

## Examples

### Victory Celebration
\`\`\`jsx
<ConfettiCelebration 
  isActive={gameWon} 
  onComplete={() => showVictoryMessage()}
  duration={7000}
/>
\`\`\`

### Tournament Winner
\`\`\`jsx
<ConfettiCelebration 
  isActive={tournamentComplete && hasWinner} 
  onComplete={() => navigateToResults()}
  duration={10000}
/>
\`\`\`

### Achievement Unlocked
\`\`\`jsx
<ConfettiCelebration 
  isActive={achievementUnlocked} 
  onComplete={() => setAchievementUnlocked(false)}
  duration={3000}
/>
\`\`\`

## Browser Compatibility

- ✅ Chrome (all versions with Canvas support)
- ✅ Firefox (all versions with Canvas support)
- ✅ Safari (iOS 9+)
- ✅ Edge (Chromium-based)

## Performance

- Uses `requestAnimationFrame` for smooth 60fps animation
- Minimal CPU usage with Canvas rendering
- Automatic cleanup on unmount
- Graceful audio fallback if sound fails to load

## Troubleshooting

### Sound not playing?

1. Check browser autoplay policies (some browsers block autoplay)
2. Ensure audio file path is correct
3. Check browser console for audio loading errors
4. Try user interaction before triggering (browsers often require user gesture)

### Animation lagging?

1. Reduce number of confetti pieces (line 103)
2. Reduce animation duration
3. Check if other animations are running simultaneously

## License

Free to use in your projects! 🎊

## Credits

Created for the ACM Tournament Event application.
