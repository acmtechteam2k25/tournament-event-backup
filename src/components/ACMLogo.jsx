import React from 'react';
import { useNavigate } from 'react-router-dom';
import acmLogo from '../assets/vnr.png';

const ACMLogo = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    // Navigate to Home using React Router — no full page reload
    navigate('/');
  };

  return (
    <div className="fixed top-4 right-4 md:right-20 z-50">
      <div
        className="bg-black/20 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center p-1 md:p-2 w-14 h-14 md:w-24 md:h-24 cursor-pointer hover:bg-black/30 transition-colors duration-200"
        onClick={handleLogoClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
        aria-label="Go to Home"
      >
        {/* Thin green border ring — reduced from border-2 to border */}
        <div className="
          w-12 h-12
          md:w-20 md:h-20
          rounded-full
          border border-[#0d9c57]/60
          flex items-center justify-center
          shadow-[0_0_10px_rgba(13,156,87,.25)]
        ">
          <img
            src={acmLogo}
            alt="ACM Logo"
            className="w-10 h-10 md:w-14 md:h-14 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default ACMLogo;
