
import React, { useState } from 'react';

import Orb from './Orb';
import PosterSection from './PosterSection';
import CountSection from './CountSection';
import AboutACM from './AboutACM';
import PreviousEdition from "./PreviousEdition";
import CurrentEdition from "./CurrentEdition";

const ACM_MEMBER_URL = 'https://aspireup.ai/organization/acm-vnrvjiet/event/100107';
const NON_MEMBER_URL = 'https://docs.google.com/forms/d/1GNRFGfg5ow7Pzmkd4Px-ls66EXfliO_W5Q6j6xZlnxM/edit'; // placeholder — replace when ready

const Home = () => {
  const [showMemberModal, setShowMemberModal] = useState(false);

  const handleJoinArena = () => {
    setShowMemberModal(true);
  };

  const handleMemberYes = () => {
    setShowMemberModal(false);
    window.open(ACM_MEMBER_URL, '_blank', 'noopener,noreferrer');
  };

  const handleMemberNo = () => {
    setShowMemberModal(false);
    window.open(NON_MEMBER_URL, '_blank', 'noopener,noreferrer');
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
              rotateOnHover={true}
              hue={0}
            />
          </div>
        </div>

        {/* Hero Content over the orb */}
        <main className="relative z-100 text-center px-4 -translate-y-5 sm:-translate-y-1">
          <h1 className="tektur-title text-3xl sm:text-6xl md:text-7xl lg:text-[4rem] xl:text-[4rem] font-bold text-white mb-0 sm:mb-8 leading-tight">
            Tesseract
          </h1>
          <h4 className="cal-sans-regular text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl text-white mb-2 sm:mb-8 leading-tight">
            The Ultimate Showdown
          </h4>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <button
              type="button"
              onClick={handleJoinArena}
              className="group relative overflow-hidden text-base sm:text-lg px-6 sm:px-7 py-1.5
                      sm:py-4 rounded-full font-semibold border-[#0d9c57] bg-gradient-to-r
                      from-[#024028] to-[#0d9c57] transition-all duration-300 hover:scale-105
                      hover:shadow-[0_0_30px_rgba(13,156,87,.55)]"
            >
              <span className="flex items-center gap-2">
                Join the Arena
              </span>
            </button>
          </div>
        </main>
      </section>

      {/* About ACM Section */}
      <AboutACM />

      {/* Current Edition */}
      <CurrentEdition />

      
      <PreviousEdition />

      {/* Poster Section */}
      <PosterSection />

      {/* Count Section */}
      {/* <CountSection /> */}

      {/* ACM Membership Modal */}
      {showMemberModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowMemberModal(false)}
        >
          <div
            className="relative w-full max-w-lg mx-auto rounded-2xl border border-[#0d9c57]/40 p-10 text-center"
            style={{ background: '#06120E', boxShadow: '0 0 40px rgba(13,156,87,0.15)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-[#024028] to-[#0d9c57]" />

            {/* Title */}
            <h2 className="tektur-title text-2xl sm:text-3xl font-bold text-white mb-4">
              ACM Membership
            </h2>

            {/* Body */}
            <p className="cal-sans-regular text-white/70 text-base sm:text-lg mb-10 leading-relaxed">
              Do you have ACM Membership?
            </p>

            {/* Buttons */}
            <div className="flex gap-4 justify-center">
              {/* Yes */}
              <button
                type="button"
                onClick={handleMemberYes}
                className="cal-sans-regular flex-1 py-3.5 px-6 rounded-full font-semibold text-white
                           bg-gradient-to-r from-[#024028] to-[#0d9c57]
                           transition-all duration-300 hover:scale-105
                           hover:shadow-[0_0_20px_rgba(13,156,87,0.55)]
                           text-sm sm:text-base sm:text-lg"
              >
                Yes
              </button>

              {/* No */}
              <button
                type="button"
                onClick={handleMemberNo}
                className="cal-sans-regular flex-1 py-3.5 px-6 rounded-full font-semibold text-white
                           bg-gradient-to-r from-[#024028] to-[#0d9c57]
                           transition-all duration-300 hover:scale-105
                           hover:shadow-[0_0_20px_rgba(13,156,87,0.55)]
                           text-sm sm:text-base sm:text-lg"
              >
                No
              </button>
            </div>

            {/* Dismiss hint */}
            <p className="cal-sans-regular mt-5 text-white/30 text-xs">
              Click outside to dismiss
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
