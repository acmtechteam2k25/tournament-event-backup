# Sound Files for Confetti Celebration

## Add Your Celebration Sound

To enable sound for the confetti animation, add an audio file here:

### Recommended Files:

1. **celebration.mp3** - Main celebration sound
2. **celebration.ogg** - Fallback for browsers that don't support MP3

### Where to Get Free Celebration Sounds:

#### Option 1: Freesound.org
- Visit: https://freesound.org/
- Search for: "celebration", "party horn", "success", "fanfare", "applause"
- Download and rename to `celebration.mp3`

#### Option 2: Zapsplat
- Visit: https://www.zapsplat.com/
- Browse: Game Sounds > UI > Success/Victory
- Free with attribution

#### Option 3: Mixkit
- Visit: https://mixkit.co/free-sound-effects/game/
- Look for: "Achievement" or "Success" sounds
- Completely free, no attribution required

#### Option 4: YouTube Audio Library
- Visit: https://studio.youtube.com/
- Go to: Audio Library
- Filter by: Sound Effects > Category: Alerts & Notification
- Free to use

### Recommended Sound Characteristics:

- **Duration**: 2-5 seconds
- **Format**: MP3 (primary) + OGG (fallback)
- **Volume**: Pre-normalized (not too loud)
- **Style**: Upbeat, celebratory (party horns, applause, fanfare, etc.)

### After Adding the Sound:

Update the audio source in `src/components/ConfettiCelebration.jsx`:

\`\`\`jsx
<audio ref={audioRef} preload="auto">
  <source src="/sounds/celebration.mp3" type="audio/mpeg" />
  <source src="/sounds/celebration.ogg" type="audio/ogg" />
</audio>
\`\`\`

### Example Sound Suggestions:

1. **Short victory fanfare** (2-3 seconds) - Great for quick celebrations
2. **Party horn blast** (1-2 seconds) - Fun and festive
3. **Crowd applause** (3-5 seconds) - For tournament victories
4. **Success chime** (1-2 seconds) - Clean and professional
5. **Confetti pop** (1 second) - Matches the visual effect

---

**Note**: The component will work without sound if no audio file is provided. The sound will gracefully fail and only the visual confetti animation will play.
