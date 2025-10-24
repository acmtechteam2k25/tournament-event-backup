import React from 'react';

const AboutACM = () => {
  return (
    <section className="py-16 px-6 sm:px-8 md:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="dm-serif-display-regular text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            About Convergence
          </h2>
          <div className="relative w-20 h-1 mx-auto mb-8">
            {/* Multiple glow layers for intense light effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-600 rounded-full shadow-[0_0_40px_rgba(251,191,36,0.8),0_0_80px_rgba(251,191,36,0.4),0_0_120px_rgba(251,191,36,0.2)]"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-90 blur-[0.5px]"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-orange-400 rounded-full"></div>
            {/* Extra glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 to-orange-600/20 rounded-full blur-xl"></div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto text-center px-2 sm:px-4">
          <div className="prose prose-lg prose-invert mx-auto">
            <p className="text-white/80 cal-sans-regular text-md lg:text-2xl sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6 text-justify">
              Convergence 2K25 is the annual technical fest of VNRVJIET, celebrated for its vibrant spirit and diverse lineup of tech-driven events. Convergence brings together enthusiastic participants from different colleges, offering a great platform for students to showcase their talent. 
            </p>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutACM;