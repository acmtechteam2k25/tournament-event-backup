import { Calendar, MapPin } from "lucide-react";
import tesseractVideo from "../assets/TessaractVideo.mp4";

import "./CurrentEdition.css";
import { Link } from "react-router-dom";

const CurrentEdition = () => {
  return (
    <section className="pt-10 px-4 pb-12">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className=" tektur-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
            Current Edition
          </h2>

          <div className="relative w-20 h-1 mx-auto mt-3">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "#0d9c57",
                boxShadow:
                  "0 0 20px rgba(13,156,87,.8), 0 0 40px rgba(13,156,87,.4)",
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-14 items-center">

          {/* Description */}
          <div className="order-2 md:order-1 max-w-3xl mx-auto px-4">
            <h2 className=" tektur-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4 text-center">
              Tesseract 2026
            </h2>

            <p className="text-white/80 cal-sans-regular text-base sm:text-lg md:text-xl leading-relaxed text-justify"
              style={{ wordSpacing: "3.5px" }}>
              Tesseract marks the next evolution of ACM VNRVJIET's flagship
              technical tournament. Get ready for exciting one-on-one battles,
              innovative challenge rounds, coding contests, and an unforgettable
              competitive experience.
            </p>



            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <button
                type="button"
                onClick={() => {
                  window.open(
                    'https://aspireup.ai/organization/acm-vnrvjiet/event/100107',
                    '_blank',
                    'noopener,noreferrer'
                  );
                }}
                className=" group relative overflow-hidden text-base sm:text-lg px-6 sm:px-7 py-1.5
                        sm:py-4 rounded-full font-semibold border-[#0d9c57] bg-gradient-to-r
                        from-[#024028] to-[#0d9c57] transition-all duration-300 hover:scale-105
                         hover:shadow-[0_0_30px_rgba(13,156,87,.55)]">
                <span className="flex items-center gap-2">
                  Register Now
                </span>
              </button>
            </div>
            <div className="mt-4 text-center">
              <Link
                to="/bracket"
                className="text-[#32d583] text-sm sm:text-base underline underline-offset-4 hover:text-[#4ade80] transition-colors duration-200"
              >
                View Tournament Bracket →
              </Link>
            </div>
          </div>

          {/* Tesseract 2k26 Poster — flip card */}
          <div className="order-1 md:order-2">
            <div className="ce-flip-container">
              <div className="ce-flipper">
                {/* Front — poster image */}
                <div className="ce-front">
                  <video
                    src={tesseractVideo}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                </div>

                {/* Back — event details */}
                <div className="ce-back">
                  <div className="ce-back-bg"></div>
                  <div className="ce-back-overlay"></div>
                  <div className="ce-back-content">
                    <h2 className="tektur-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white sm:mb-6">
                      Tesseract
                    </h2>
                    <div className="relative w-20 h-1 mx-auto mb-5 md:mb-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#024028] to-[#0d9c57] rounded-full shadow-[0_0_40px_rgba(13,156,87,0.8),0_0_80px_rgba(13,156,87,0.4),0_0_120px_rgba(13,156,87,0.2)]"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#024028] to-[#0d9c57] rounded-full opacity-90 blur-[0.5px]"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#024028] to-[#0d9c57] rounded-full"></div>
                      <div className="absolute -inset-4 bg-gradient-to-r from-[#024028]/20 to-[#0d9c57]/20 rounded-full blur-xl"></div>
                    </div>
                    <div className="text-[10px] md:text-2xl cal-sans-regular md:space-y-1">

                      <p className="underline underline-offset-4 md:text-2xl">
                        Qualifiers
                      </p>

                      <div className="text-left md:ml-10 mt-4 md:space-y-2">

                        <p className="flex items-center">
                          <Calendar className="mr-2 size-4 md:size-5" />
                          10<sup className="mr-1">th</sup> August 2026
                        </p>

                        <p className="flex items-center">
                          <MapPin className="mr-2 size-4 md:size-5" />
                          VNR VJIET
                        </p>

                      </div>

                      <div className="h-6 md:h-8"></div>

                      <p className="underline underline-offset-4 md:text-2xl">
                        Knockouts
                      </p>

                      <div className="text-left md:ml-10 mt-4 md:space-y-2">

                        <p className="flex items-center">
                          <Calendar className="mr-2 size-4 md:size-5" />
                          11<sup className="mr-1">th</sup> August 2026
                        </p>

                        <p className="flex items-center">
                          <MapPin className="mr-2 size-4 md:size-5" />
                          VNR VJIET
                        </p>

                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default CurrentEdition;