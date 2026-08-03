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
<<<<<<< HEAD
          <h3 className="text-white text-4xl font-bold text-center mb-5">
            Tech Tournament 2025
          </h3>
=======
         
>>>>>>> 30a553cfae074b1b8d62bbdb0a86c9a47e64b173
          <p
            className="text-white/80 cal-sans-regular text-base sm:text-lg md:text-xl leading-relaxed text-justify"
            style={{ wordSpacing: "3.5px" }}
          >
            The Tech Tournament was organized by Team ACM VNRVJIET for all years as part of Convergence 2025.
            After a screening round, the top 64 participants out of 231 advanced to on-campus, one-on-one technical knockout rounds.
            Winners and runners-up were recognized with certificates and a ₹12,000 cash prize pool.
          </p>
        </div>

      </div>
    </section>
  );
};

export default PreviousEdition;
