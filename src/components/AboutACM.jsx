import CovergencePost from "../assets/Convergence Logo_2025_black.png";

const AboutACM = () => {
  return (
    <section className="py-16 sm:px-8 md:px-4" style={{ backgroundColor: 'transparent' }}>
      <div className="mx-5">
        <div className="flex flex-col">
          <div className="top text-center">
            <h2 className=" tektur-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
              About Tesseract

            </h2>
            <div className="relative w-20 h-1 mx-auto mb-4">
              {/* Multiple glow layers for intense light effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-600 rounded-full shadow-[0_0_40px_rgba(251,191,36,0.8),0_0_80px_rgba(251,191,36,0.4),0_0_120px_rgba(251,191,36,0.2)]"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-90 blur-[0.5px]"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-orange-400 rounded-full"></div>
              {/* Extra glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 to-orange-600/20 rounded-full blur-xl"></div>
            </div>
          </div>
          <div className="bottom flex flex-wrap">
            <div className="w-full md:w-1/2">
              <img
                src={CovergencePost}
                alt="Convergence"
                className="aspect-video w-full object-cover"
              />
            </div>
            <div className="w-full md:w-1/2 mx-auto text-justify px-2 sm:px-4">
              <div className="prose prose-lg prose-invert mx-auto h-full flex flex-col justify-center items-center">
                <p className="text-white/80 cal-sans-regular text-md lg:text-2xl sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6 text-justify">
                  Tesseract, formerly known as Tech Tournament, is ACM VNRVJIET's premier 1 vs 1 knockout technical competition. Designed to bring out the best technical talent on campus, participants compete head-to-head through successive elimination rounds.
                </p>
                <button
                  onClick={() =>
                    window.open(
                      "https://vnrvjiet.acm.org/"
                    )
                  }
                  className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-black font-semibold py-2 md:py-3 px-5 md:px-10 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-amber-400/20 text-lg"
                >
                  Get Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutACM;
