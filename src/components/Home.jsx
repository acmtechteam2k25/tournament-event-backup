import React from 'react';
import { Link } from 'react-router-dom';
import Orb from './Orb';
import PosterSection from './PosterSection';
import CountSection from './CountSection';
import AboutACM from './AboutACM';
import ACMLogo from './ACMLogo';

const Home = () => {
  return (
    <>
      {/* ACM Logo */}
      <ACMLogo />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Background Orb */}
        <div className="absolute inset-0 flex items-center justify-center -translate-y-8">
          <Orb
            hoverIntensity={0}
            rotateOnHover={true}
            hue={194}
            forceHoverState={false}
          />
        </div>
        
        {/* Hero Content over the orb */}
        <main className="relative z-10 text-center px-4 -translate-y-8">
          <h1 className="cal-sans-regular text-5xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 sm:mb-8 leading-tight">
            Tournament
          </h1>
          <h4 className="cal-sans-regular text-3xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-6 sm:mb-8 leading-tight">
            Fight to the Top
          </h4>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link 
              to="/bracket"
              className="cal-sans-regular bg-white text-lg sm:text-xl md:text-2xl text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors w-full sm:w-auto inline-block text-center"
            >
              Bracket View
            </Link>
            <button className="cal-sans-regular border text-lg sm:text-xl md:text-2xl border-white/30 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto">
              Learn More
            </button>
          </div>
        </main>
      </section>
      {/* About ACM Section */}
      <AboutACM />

      {/* Poster Section */}
      <PosterSection />

      {/* Count Section */}
      <CountSection />

      
    </>
  );
};

export default Home;