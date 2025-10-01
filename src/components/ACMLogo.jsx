import React from 'react';
import acmLogo from '../assets/ACM.png';

const ACMLogo = () => {
  return (
    <div className="fixed top-4 left-20 z-50 hidden md:block">
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-full p-6 shadow-lg flex items-center justify-center">
        <img 
          src={acmLogo} 
          alt="ACM Logo" 
          className="w-20 h-20 object-contain"
        />
      </div>
    </div>
  );
};

export default ACMLogo;