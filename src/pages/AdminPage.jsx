import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { config } from '../config';
import Login from '../components/Login';
import TournamentBracketViewClean from '../components/TournamentBracketViewClean';
import TournamentInitializer from '../components/TournamentInitializer';
import DatabaseTestPage from '../components/DatabaseTestPage';
import './AdminPage.css';

const AdminPage = () => {
  const { isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('bracket');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  // Year switcher state
  const [tournamentKey, setTournamentKey] = useState(config.DEFAULT_TOURNAMENT_KEY);
  const tournamentId = config.TOURNAMENTS?.[tournamentKey]?.id || config.TOURNAMENT_ID;

  const handleLoginSuccess = () => {
    // no-op, auth is managed by context/localStorage
  };

  const handleLogout = () => {
    logout();
  };

  const handleMenuItemClick = (tab, year = null) => {
    setActiveTab(tab);
    if (year) {
      setTournamentKey(year);
    }
    setIsMenuOpen(false); // Close menu after selection
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="admin-page pt-28">
      <div className="admin-header bg-white shadow-sm border-b relative" ref={menuRef}>
        <div className="grid grid-cols-3 items-center px-6 py-4">
          {/* Hamburger Menu Button */}
          <div className="flex justify-start">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col justify-center items-center w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-gray-600 my-1 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>
          </div>

          {/* Centered Title */}
          <div className="flex justify-center">
            <h1 className="text-2xl font-bold text-gray-800 whitespace-nowrap">
              Tournament Admin
            </h1>
          </div>

          {/* Logout Button */}
          <div className="flex justify-end">
            <button 
              onClick={handleLogout} 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Minimal Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-6 w-80 bg-black/20 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-50 mt-2">
            <div className="p-4">
              {/* Navigation Section */}
              <div className="mb-4">
                <div className="space-y-2">
                  <button
                    onClick={() => handleMenuItemClick('bracket')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === 'bracket'
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Bracket View
                  </button>
                  <button
                    onClick={() => handleMenuItemClick('setup')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === 'setup'
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Tournament Setup
                  </button>
                  <button
                    onClick={() => handleMenuItemClick('database')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === 'database'
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Database Status
                  </button>
                </div>
              </div>

              {/* Year Toggle Switch */}
              <div className="border-t border-white/20 pt-4">
                <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-1">
                  <div className={`absolute top-1 w-1/2 h-8 bg-white/30 backdrop-blur-md rounded-full transition-transform duration-300 ${
                    tournamentKey === 'thirdYear' ? 'translate-x-full' : 'translate-x-0'
                  }`}></div>
                  <div className="relative flex">
                    <button
                      onClick={() => handleMenuItemClick(activeTab, 'secondYear')}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${
                        tournamentKey === 'secondYear'
                          ? 'text-gray-800'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      2nd Year
                    </button>
                    <button
                      onClick={() => handleMenuItemClick(activeTab, 'thirdYear')}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${
                        tournamentKey === 'thirdYear'
                          ? 'text-gray-800'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      3rd Year
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="admin-content">
        {activeTab === 'bracket' && (
          <TournamentBracketViewClean isEditable={true} tournamentId={tournamentId} />
        )}
        
        {activeTab === 'setup' && (
          <TournamentInitializer 
            tournamentId={tournamentId}
            onTournamentCreated={(tournament) => {
              // Tournament ID is fixed, switch to bracket tab
              setActiveTab('bracket');
            }}
          />
        )}
        
        {activeTab === 'database' && (
          <DatabaseTestPage />
        )}
      </div>
    </div>
  );
};

export default AdminPage;