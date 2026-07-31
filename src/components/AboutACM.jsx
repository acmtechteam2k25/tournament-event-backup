const AboutACM = () => {
  return (
    <section className="py-10 sm:px-8 md:px-4" style={{ backgroundColor: 'transparent' }}>
      <div className="mx-5">
        <div className="flex flex-col">
          <div className="top text-center">
            <h2 className=" tektur-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
              About Tesseract

            </h2>
            <div className="relative w-20 h-1 mx-auto mb-4">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "#0d9c57",
                  boxShadow:
                    "0 0 20px rgba(13,156,87,0.8), 0 0 40px rgba(13,156,87,0.4)"
                }}
              ></div>
            </div>
          </div>
          <div className="max-w-3xl mx-auto mt-8 px-4">
            <p className="text-white/80 cal-sans-regular text-base sm:text-lg md:text-xl leading-relaxed text-justify"
            style={{ wordSpacing: "3.5px" }}>
              Tesseract,  formerly known as Tech Tournament, is ACM VNRVJIET's premier 1 vs 1 knockout technical competition. Designed to bring out the best technical talent on campus, participants compete head-to-head through successive elimination rounds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutACM;
