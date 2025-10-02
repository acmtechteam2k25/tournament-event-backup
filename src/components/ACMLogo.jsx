import React from 'react';
import acmLogo from '../assets/ACM.png';

const ACMLogo = () => {
  return (
    <div className="fixed top-4 left-20 z-50 hidden md:block">
      <div className="bg-black/20 backdrop-blur-md  rounded-full shadow-lg flex items-center justify-center p-1 w-22 h-22">
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