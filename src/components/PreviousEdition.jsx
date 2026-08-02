const PreviousEdition = () => {
  return (
    <section className="pt-6 px-4 pb-12">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="tektur-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Previous Edition
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

        {/* Content — full-width single column now that logo is removed */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-white text-4xl font-bold text-center mb-5">
            Convergence 2025
          </h3>
          <p
            className="text-white/80 cal-sans-regular text-base sm:text-lg md:text-xl leading-relaxed text-justify"
            style={{ wordSpacing: "3.5px" }}
          >
            Before evolving into{" "}
            <span className="text-[#0d9c57] font-semibold">Tesseract</span>,
            the event was conducted as Tech Tournament under Convergence. It
            brought together students in an exciting knockout-style technical
            competition where participants competed one-on-one across multiple
            rounds.
          </p>
        </div>

      </div>
    </section>
  );
};

export default PreviousEdition;
