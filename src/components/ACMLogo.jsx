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
      <button
        onClick={handleLogoClick}
        onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
        aria-label="Go to Home"
        className="
          group
          relative overflow-hidden
          w-14 h-14 md:w-20 md:h-20
          rounded-full
          cursor-pointer
          transition-all duration-300
          hover:scale-105
        "
        style={{
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          padding: 0,
        }}
      >
        {/* Glossy top-highlight layer — same effect as Join the Arena button */}
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 60%)',
          }}
        />

        {/* Logo image — unchanged */}
        <span className="relative z-10 flex items-center justify-center w-full h-full">
          <img
            src={acmLogo}
            alt="ACM Logo"
            className="w-12 h-12 md:w-16 md:h-16 object-contain"
          />
        </span>
      </button>
    </div>
  );
};

export default ACMLogo;
