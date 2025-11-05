import React, { useState } from 'react';
import ConfettiCelebration from './ConfettiCelebration';

/**
 * Example usage of ConfettiCelebration component
 * 
 * This component shows how to integrate the confetti animation
 * into your application.
 */
const ConfettiExample = () => {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleCelebrate = () => {
    setShowConfetti(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
      {/* Confetti Component */}
      <ConfettiCelebration 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)}
        duration={5000} // 5 seconds
      />

      {/* Trigger Button */}
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8 bodoni-moda">
          🎉 Celebration Time! 🎉
        </h1>
        
        <button
          onClick={handleCelebrate}
          disabled={showConfetti}
          className={`px-8 py-4 text-xl font-bold rounded-lg transform transition-all duration-200 ${
            showConfetti
              ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black hover:scale-110 shadow-2xl hover:shadow-amber-400/50'
          }`}
        >
          {showConfetti ? 'Celebrating...' : 'Start Celebration! 🎊'}
        </button>

        <div className="mt-8 text-white/70 max-w-md mx-auto">
          <p className="text-sm">
            Click the button to trigger a full-page confetti animation with sound!
          </p>
          <p className="text-xs mt-4">
            Duration: 5 seconds • Pieces: 150 • Colors: 8 variations
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfettiExample;
