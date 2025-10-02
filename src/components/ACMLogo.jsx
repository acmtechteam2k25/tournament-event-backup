import React from 'react';
import acmLogo from '../assets/ACM.png';

const ACMLogo = () => {
  return (
    <div className="fixed top-4 left-4 md:left-20 z-50">
      <div className="bg-black/20 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center p-1 md:p-2 w-14 h-14 md:w-24 md:h-24">
        <img 
          src={acmLogo} 
          alt="ACM Logo" 
          className="w-12 h-12 md:w-20 md:h-20 object-contain"
        />
      </div>
    </div>
  );
};

export default ACMLogo;