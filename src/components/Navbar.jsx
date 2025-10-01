import React from 'react';
import { Link } from 'react-router-dom';
import acmLogo from '../assets/ACM.png';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black  border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2 min-h-16">
          {/* ACM Logo - Left side */}
          <div className="flex items-center ml-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center">
                <img 
                  src={acmLogo} 
                  alt="ACM Logo" 
                  className="w-16 h-16 object-contain max-h-14"
                />
              </div>
            </div>
          </div>

          {/* Navigation Items - Right side */}
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-white hover:text-blue-400 transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            <Link 
              to="/bracket" 
              className="text-white hover:text-blue-400 transition-colors duration-200 font-medium"
            >
              Bracket View
            </Link>
            <Link 
              to="/admin" 
              className="text-white hover:text-blue-400 transition-colors duration-200 font-medium"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;