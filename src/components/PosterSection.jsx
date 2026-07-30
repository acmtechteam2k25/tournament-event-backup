import React from "react";
import eventPoster from "../assets/poster.png";
import { Calendar, MapPin } from "lucide-react";
import "./PosterSection.css"; // make sure path matches file name

const PosterSection = () => {
  return (
    <section id="poster-section" className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* === Section Header === */}
        <div className="text-justify mb-12 sm:mb-16">
          <h2 className="dm-serif-display-regular text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-4">
            What is it?
          </h2>
          <p className="cal-sans-regular text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Previously featured under Convergence as Tech Tournament, Tesseract now stands as an independent technical tournament conducted by ACM VNRVJIET.
          </p>
          <div className="mt-6 text-center">
            <a
              className="cal-sans-regular bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/30 text-orange-200 hover:text-orange-100 px-6 py-3 md:px-6 md:py-2 rounded-lg backdrop-blur-sm transition-all duration-200 text-xl md:text-1xl inline-block"
              href="https://unstop.com/p/tech-tournament-vallurupalli-nageswara-rao-vignana-jyothi-institute-of-engineering-technology-telangana-1578635"
              target="_blank"
              rel="noopener noreferrer"
            >
              Register Now
            </a>
          </div>
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
                <h2 className="dm-serif-display-regular text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white sm:mb-4">
                  Tech Tournament
                </h2>
                <div className="relative w-20 h-1 mx-auto md:mb-8">
                  {/* Multiple glow layers for intense light effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-600 rounded-full shadow-[0_0_40px_rgba(251,191,36,0.8),0_0_80px_rgba(251,191,36,0.4),0_0_120px_rgba(251,191,36,0.2)]"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-90 blur-[0.5px]"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-orange-400 rounded-full"></div>
                  {/* Extra glow effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 to-orange-600/20 rounded-full blur-xl"></div>
                </div>
                <div className="text-[10px] md:text-2xl cal-sans-regular md:space-y-2">
                  <p className="underline underline-offset-4  md:tex-2xl">
                    Qualifiers
                  </p>
                  <div className="text-left md:ml-10 md:space-y-2">
                    <p className="flex justify-start items-center">
                      <Calendar className="mr-1 size-5" />3
                      <sup className="mr-1">rd </sup> November 2025
                    </p>
                    <p className="flex justify-start items-center">
                      <MapPin className="mr-1 size-5" />
                      VNR VJIET
                    </p>
                  </div>
                  <p className="md:text-2xl underline underline-offset-4">
                    Knockouts
                  </p>
                  <div className="text-left md:ml-10 md:space-y-2">
                    <p className="flex justify-start items-center">
                      <Calendar className="mr-1 size-5" />4<sup className="mr-1">th</sup>
                      November 2025
                    </p>
                    <p className="flex justify-start items-center">
                      <MapPin className="mr-1 size-5" />
                      VNR VJIET
                    </p>
                  </div>
                </div>
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
