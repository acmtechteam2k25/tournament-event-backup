
import React from 'react';
import { Link } from 'react-router-dom';
import Orb from './Orb';
import PosterSection from './PosterSection';
import CountSection from './CountSection';
import AboutACM from './AboutACM';
import PreviousEdition from "./PreviousEdition";
import CurrentEdition from "./CurrentEdition";

const Home = () => {
  const scrollToPoster = () => {
    const posterSection = document.getElementById("poster-section");
    if (posterSection) {
      posterSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* Hero Section */}
      
        <section className="relative h-screen flex items-center justify-center bg-transparent">
          {/* Background Orb */}
          <div className="absolute inset-0 flex items-center justify-center -translate-y-8">

       <div className="w-full h-full max-w-[120vw] max-h-[120vw] sm:max-w-full sm:max-h-full">
        <Orb
            hoverIntensity={0}
            rotateOnHover = {true}
            hue={15}
           
        />
    </div>
    </div>
          {/* Hero Content over the orb */}
          <main className="relative z-100 text-center px-4 -translate-y-5 sm:-translate-y-1">
            <h1 className="tektur-title text-3xl sm:text-6xl md:text-7xl lg:text-[4rem] xl:text-[4rem] font-bold text-white mb-0 sm:mb-8 leading-tight">
              Tesseract
            </h1>
            <h4 className="cal-sans-regular text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl font-bold text-white mb-2 sm:mb-8 leading-tight">
              The Ultimate Showdown
            </h4>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <button
                type="button"
                onClick={() => {
                  window.open(
                    'https://vnrvjiet.acm.org/',
                    '_blank',
                    'noopener,noreferrer'
                  );
                }}
                className=" group relative overflow-hidden text-base sm:text-lg px-6 sm:px-7 py-1.5
                        sm:py-4 rounded-full font-semibold border-[#0d9c57] bg-gradient-to-r
                        from-[#024028] to-[#0d9c57] transition-all duration-300 hover:scale-105
                         hover:shadow-[0_0_30px_rgba(13,156,87,.55)]">
              <span className="flex items-center gap-2">
                Join the Arena
              </span>
            </button>
          </div>
        </main>
        </section>
        {/* About ACM Section */}
        <AboutACM />
        <CurrentEdition /> 
        <PreviousEdition />
        
        {/* Poster Section */}
        <PosterSection />
        
        {/* Count Section */}
        {/* <CountSection /> */}
    </>
  );
};
export default Home;
