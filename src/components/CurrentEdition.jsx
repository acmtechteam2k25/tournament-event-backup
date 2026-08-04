const CurrentEdition = () => {
  return (
    <section className="pt-10 px-4 pb-12">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="tektur-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
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
           <h3 className="text-white text-3xl sm:text-4xl font-bold text-center mb-5">
              Tesseract 2026
            </h3>

            <p className="text-white/80 cal-sans-regular text-base sm:text-lg md:text-xl leading-relaxed text-justify"
              style={{ wordSpacing: "3.5px" }}>
              Tesseract marks the next evolution of ACM VNRVJIET's flagship
              technical tournament. Get ready for exciting one-on-one battles,
              innovative challenge rounds, coding contests, and an unforgettable
              competitive experience.
            </p>

            <p
              className="text-white/60 mt-5 text-base md:text-lg"
              style={{ wordSpacing: "3px" }}
            >
              Official event poster, registrations, and schedule will be
              announced soon.
            </p>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  window.open(
                    "https://aspireup.ai/organization/acm-vnrvjiet/event/100107",
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
                className="group relative overflow-hidden text-base sm:text-lg px-6 sm:px-7 py-1.5 sm:py-4 rounded-full font-semibold border-[#0d9c57] bg-gradient-to-r from-[#024028] to-[#0d9c57] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(13,156,87,.55)]"
              >
                <span className="flex items-center gap-2 text-white">
                  Register Now
                </span>
              </button>
            </div>
          </div>

          {/* Placeholder Poster */}
          <div className="order-1 md:order-2">
            <div
              className="w-[95%] mx-auto aspect-video rounded-xl border-2 flex items-center justify-center"
              style={{
                borderColor: "#0d9c57",
                background: "#111",
                boxShadow: "0 0 25px rgba(13,156,87,.18)",
              }}
            >
              <div className="text-center">
                <h3 className="text-white text-2xl font-bold mb-3">
                  Poster Coming Soon
                </h3>

                <p className="text-white/60">
                  Official Tesseract Poster
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default CurrentEdition;