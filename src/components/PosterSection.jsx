import React from "react";
import eventPoster from "../assets/poster.jpg";
import "./PosterSection.css"; // make sure path matches file name

const PosterSection = () => {
  return (
    <section id="poster-section" className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* === Section Header === */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="dm-serif-display-regular text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            What is it?
          </h2>
          <p className="cal-sans-regular text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Tech Tournament is a first-of-its-kind, multi-round technical
            competition conducted as part of Convergence 2K25. The entire event
            follows a 1 vs 1 head-to-head structure, giving participants a true
            tournament-style experience.
          </p>
        </div>

        {/* === Poster Flip Container === */}
        <div className="flip-container">
          <div className="flipper">
            {/* === Front Side === */}
            <div className="front">
              <img src={eventPoster} alt="Tournament 2K25 Event Poster" />
            </div>

            {/* === Back Side === */}
            <div className="back">
              <div className="back-bg"></div>
              <div className="back-overlay"></div>
              <div className="back-content">
                <h3>Tech Tournament</h3>
                <p>Qualifiers</p>
                <p>3rd November 2025</p>
                <p>At VNR VJIET</p>
                <p>Knockouts</p>
                <p>4th November 2025</p>
                <p>At VNR VJIET</p>
                <p>🏆 Prize Pool: 15,000</p>
              </div>
            </div>
          </div>
        </div>
        {/* === End Poster === */}
      </div>
    </section>
  );
};

export default PosterSection;
