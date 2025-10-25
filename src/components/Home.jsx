import React from 'react';
import { Link } from 'react-router-dom';
import Orb from './Orb';
import PosterSection from './PosterSection';
import CountSection from './CountSection';
import AboutACM from './AboutACM';

const Home = () => {
  const scrollToPoster = () => {
    const posterSection = document.getElementById('poster-section');
    if (posterSection) {
      posterSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Background Orb */}
        <div className="absolute inset-0 flex items-center justify-center -translate-y-8">
          <div className="w-full h-full max-w-[120vw] max-h-[120vw] sm:max-w-full sm:max-h-full">
            <Orb
              hoverIntensity={0}
              rotateOnHover={true}
              hue={194}
              forceHoverState={false}
            />
          </div>
        </div>

        {/* Hero Content over the orb */}
        <main className="relative z-10 text-center px-4 -translate-y-5 sm:-translate-y-1">
          <h1 className="tea-chest-regular text-3xl sm:text-6xl md:text-7xl lg:text-[4rem] xl:text-[4rem] font-bold text-white mb-0 sm:mb-8 leading-tight">
            Tech Tournament
          </h1>
          <h4 className="cal-sans-regular text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl font-bold text-white mb-2 sm:mb-8 leading-tight">
            The Ultimate Showdown
          </h4>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            {/* <Link
              to="/bracket"
              className="cal-sans-regular bg-white text-sm sm:text-xl md:text-2xl text-black px-3 sm:px-5 py-1 sm:py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors sm:w-auto inline-block text-center"
            >
              Bracket View
            </Link> */}
            {/* <button
              onClick={scrollToPoster}
              className="cal-sans-regular border text-base hidden sm:block sm:text-xl md:text-2xl border-white/30 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-full font-semibold hover:bg-white/10 transition-colors w-3/4 sm:w-auto"
            >
              Learn More
            </button> */}
          </div>
        </main>
      </section>
      {/* About ACM Section */}
      <AboutACM />

      {/* Poster Section */}
      <PosterSection />

      {/* Count Section */}
      {/* <CountSection /> */}


    </>
  );
};

export default Home;