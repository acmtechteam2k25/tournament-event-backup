import React from 'react';
import eventPoster from '../assets/event-poster.jpg';
import './PosterSection.css'

const PosterSection = () => {
  return (
    <section id="poster-section" className="py-16 sm:py-20 lg:py-24 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="dm-serif-display-regular text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            What is it?
          </h2>
          <p className="cal-sans-regular text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Join us for the ultimate tournament experience - where champions are made and legends are born.
          </p>
        </div>

        {/* Poster Container */}
        <div className="flip-container">
          <div className="flipper ">
            {/* Front */}
            <div className="front">
              <img src={eventPoster} className='w-full h-full' alt="Tournament 2K25 Event Poster" />
            </div>

            {/* Back */}
            <div className="back">
              <div className="back-bg"></div>
              <div className="back-overlay"></div>
              <div className="back-content">
                <h3>Tournament 2K25</h3>
                <p>📅 October 9–11, 2025</p>
                <p>👥 64 Players • Single Elimination</p>
                <p>🏆 Prize Pool: $10,000</p>
              </div>
            </div>
          </div>
        </div>
        {/* Additional Info Below Poster */}

      </div>
    </section>
  );
};

export default PosterSection;

<div className="flex justify-center">
  <div className="relative max-w-4xl w-full">
    {/* Flip Wrapper preserving original sizing and hover only on image */}
    <div className="relative group [perspective:1200px] max-w-4xl w-full">
      {/* Flipper */}
      <div className="relative h-[80vh] w-full transition-transform duration-700 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] rounded-xl shadow-2xl overflow-hidden">

        {/* Front (Poster) */}
        <div className="absolute inset-0 [backface-visibility:hidden] flex items-center justify-center bg-black">
          <img
            src={eventPoster}
            alt="Tournament 2K25 Event Poster"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Back (Text side) */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center bg-gray-900 p-6">
          <p className="text-white text-2xl sm:text-3xl md:text-4xl font-bold text-center">
            Sample event details appear here on hover
          </p>
        </div>
      </div>
    </div>



    {/* Glow Effect */}
  </div>
</div>
