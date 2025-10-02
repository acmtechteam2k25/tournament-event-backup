import React from 'react';

const PosterSection = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className=" bodoni-moda text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            What is it?
          </h2>
          <p className="cal-sans-regular text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Join us for the ultimate tournament experience - where champions are made and legends are born.
          </p>
        </div>

        {/* Poster Container */}
        <div className="flex justify-center">
          <div className="relative group max-w-2xl w-full">
            {/* Event Poster Image */}
            <div className="aspect-[3/4] rounded-2xl shadow-2xl overflow-hidden border border-gray-700 group-hover:shadow-3xl transition-all duration-300">
              <img 
                src={require('../assets/event-poster.jpg')} 
                alt="Tournament 2K25 Event Poster"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image doesn't load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              
              {/* Fallback content if image fails to load */}
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-gray-800 to-gray-900" style={{display: 'none'}}>
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full mb-6 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <h3 className="cal-sans-regular text-3xl sm:text-4xl font-bold text-white mb-4">
                  Tournament 2K25
                </h3>
                
                <div className="space-y-2 text-gray-300">
                  <p className="text-lg font-semibold">October 9-11, 2025</p>
                  <p className="text-base">64 Players • Single Elimination</p>
                  <p className="text-base">Prize Pool: $10,000</p>
                </div>
                
                <div className="mt-6 px-6 py-2 bg-gradient-to-r from-amber-400 to-orange-600 rounded-full">
                  <span className="text-white font-semibold">Register Now</span>
                </div>
              </div>
            </div>
            
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 to-orange-600/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
          </div>
        </div>

        {/* Additional Info Below Poster */}
        
      </div>
    </section>
  );
};

export default PosterSection;