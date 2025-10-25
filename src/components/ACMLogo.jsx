import React from 'react';
import acmLogo from '../assets/vnr.png';

const ACMLogo = () => {
  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <div className="fixed top-4 right-4 md:right-20 z-50">
      <div 
        className="bg-black/20 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center p-1 md:p-2 w-14 h-14 md:w-24 md:h-24 cursor-pointer hover:bg-black/30 transition-colors duration-200"
        onClick={handleLogoClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
      >
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