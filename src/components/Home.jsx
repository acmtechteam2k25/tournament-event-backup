
import React from 'react';
import { Link } from 'react-router-dom';
import Orb from './Orb';
import PosterSection from './PosterSection';
import CountSection from './CountSection';
import AboutACM from './AboutACM';

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

    <div
        className="absolute rounded-full"
        style={{
            width: "42rem",
            height: "42rem",
            background:
                "radial-gradient(circle, #024028 0%, #024028 45%, transparent 72%)",
            filter: "blur(45px)",
            opacity: 0.95,
        }}
    />

    <div className="w-full h-full max-w-[120vw] max-h-[120vw] sm:max-w-full sm:max-h-full">
        <Orb
            hoverIntensity={0}
            rotateOnHover
            hue={194}
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
                className="group cal-sans-regular text-sm sm:text-xl md:text-2xl px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-transform duration-200 transform bg-gradient-to-r from-amber-300/10 via-amber-200/10 to-orange-400/10 hover:from-amber-400 hover:to-orange-500 hover:scale-105 shadow-lg hover:shadow-amber-400/40 backdrop-blur-sm border border-amber-300/30 inline-block text-center cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-300/30 shiny-btn"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-700 group-hover:text-black">
                  Join the Arena
                </span>
              </button>
              
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
