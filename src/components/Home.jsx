import React, { useState } from 'react';
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

  const [showModal, setShowModal] = useState(false);

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
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => setShowModal(true)}
              className="group cal-sans-regular text-sm sm:text-xl md:text-2xl px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-transform duration-200 transform bg-gradient-to-r from-amber-300/10 via-amber-200/10 to-orange-400/10 hover:from-amber-400 hover:to-orange-500 hover:scale-105 shadow-lg hover:shadow-amber-400/40 backdrop-blur-sm border border-amber-300/30 inline-block text-center cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-300/30"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-700 group-hover:text-black">
                Join the Arena
              </span>
            </button>
            {/* <button
              onClick={scrollToPoster}
              className="cal-sans-regular border text-base hidden sm:block sm:text-xl md:text-2xl border-white/30 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-full font-semibold hover:bg-white/10 transition-colors w-3/4 sm:w-auto"
            >
              Learn More
            </button> */}
          </div>
        </main>
      </section>
      {/* Modal: Convergence Pass question */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* glass modal */}
          <div
            className="relative bg-white/5 backdrop-blur-md border border-white/20 rounded-xl p-6 max-w-lg w-[90%] mx-auto text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Convergence pass question"
          >
            <h3 className="dm-serif-display-regular text-xl sm:text-2xl font-bold text-white mb-3">
              Do you have convergence pass?
            </h3>
            <p className="text-white/80 mb-6">Select an option to continue</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  window.open(
                    'https://unstop.com/p/tech-tournament-vallurupalli-nageswara-rao-vignana-jyothi-institute-of-engineering-technology-telangana-1578635',
                    '_blank',
                    'noopener,noreferrer'
                  );
                  setShowModal(false);
                }}
                className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold py-2 px-6 rounded-lg hover:from-amber-500 hover:to-orange-600 transition-colors"
              >
                Yes
              </button>

              <button
                onClick={() => {
                  window.open(
                    'https://axisbpayments.razorpay.com/pl_Pq0BHPyKE4qna8/view',
                    '_blank',
                    'noopener,noreferrer'
                  );
                  setShowModal(false);
                }}
                className="bg-white/10 text-white font-semibold py-2 px-6 rounded-lg border border-white/10 hover:bg-white/20 transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

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