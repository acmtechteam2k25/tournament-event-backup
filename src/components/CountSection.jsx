import React from 'react';
import CountUp from './CountUp';

const CountSection = () => {
  return (
    <section className="relative py-16 px-4 bg-black/10 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="bodoni-moda-bold text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Tournament Statistics
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Real-time numbers from our exciting tournament competition
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Players Count */}
          <div className="text-center group">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 bodoni-moda-bold">
                <CountUp
                  from={0}
                  to={64}
                  separator=","
                  direction="up"
                  duration={2.5}
                  delay={0.2}
                  className="count-up-text"
                />
              </div>
              <h3 className="text-white/90 text-lg sm:text-xl font-semibold mb-1 bodoni-moda">Players</h3>
              <p className="text-white/60 text-sm">Competing for glory</p>
            </div>
          </div>

          {/* Rounds Count */}
          <div className="text-center group">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 bodoni-moda-bold">
                <CountUp
                  from={0}
                  to={6}
                  separator=","
                  direction="up"
                  duration={2}
                  delay={0.4}
                  className="count-up-text"
                />
              </div>
              <h3 className="text-white/90 text-lg sm:text-xl font-semibold mb-1 bodoni-moda">Rounds</h3>
              <p className="text-white/60 text-sm">Elimination stages</p>
            </div>
          </div>

          {/* Matches Count */}
          <div className="text-center group">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 bodoni-moda-bold">
                <CountUp
                  from={0}
                  to={63}
                  separator=","
                  direction="up"
                  duration={3}
                  delay={0.6}
                  className="count-up-text"
                />
              </div>
              <h3 className="text-white/90 text-lg sm:text-xl font-semibold mb-1 bodoni-moda">Matches</h3>
              <p className="text-white/60 text-sm">Total battles fought</p>
            </div>
          </div>

          {/* Winner Count */}
          <div className="text-center group">
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-300">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-yellow-400 mb-2 bodoni-moda-bold">
                <CountUp
                  from={0}
                  to={1}
                  separator=","
                  direction="up"
                  duration={1.5}
                  delay={0.8}
                  className="count-up-text"
                />
              </div>
              <h3 className="text-yellow-400/90 text-lg sm:text-xl font-semibold mb-1 bodoni-moda">Winner</h3>
              <p className="text-yellow-400/60 text-sm">Champion emerges</p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 border border-white/10">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/80 text-sm bodoni-moda">Tournament in progress</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CountSection;