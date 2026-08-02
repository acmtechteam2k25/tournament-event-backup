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
    } // Close menu after selection
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
    <div className="admin-page pt-10 bg-black min-h-screen">
      <div className="admin-header bg-black border-b border-white/20 relative" ref={menuRef}>
        <div className="flex items-center justify-between w-full sm:px-6">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex flex-col justify-center items-center w-8 h-8 p-1 transition-all duration-200 group"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.6)] group-hover:shadow-[0_0_12px_rgba(255,255,255,0.8)] ${isMenuOpen ? 'rotate-45 translate-y-1.5' : 'mb-1'}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.6)] group-hover:shadow-[0_0_12px_rgba(255,255,255,0.8)] ${isMenuOpen ? 'opacity-0' : 'mb-1'}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.6)] group-hover:shadow-[0_0_12px_rgba(255,255,255,0.8)] ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>

          {/* Centered Title */}
          

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="tektur-title bg-[#024028]/60 hover:bg-[#024028] border border-[#0d9c57]/40 hover:border-[#0d9c57] text-white px-3 py-1.5 rounded backdrop-blur-sm transition-all duration-200 text-sm hover:shadow-[0_0_14px_rgba(13,156,87,0.4)]"
          >
            Logout
          </button>
        </div>

        {/* Minimal Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-3/4 left-4 sm:left-6 w-72 sm:w-80 bg-black/20 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl z-50 mt-2">
            <div className="p-4">
              {/* Navigation Section */}
              <div className="mb-4">
                <div className="space-y-2">
                  <button
                    onClick={() => handleMenuItemClick('bracket')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'bracket'
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    Bracket View
                  </button>
                  <button
                    onClick={() => handleMenuItemClick('setup')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'setup'
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    Tournament Setup
                  </button>
                  <button
                    onClick={() => handleMenuItemClick('database')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'database'
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
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleMenuItemClick(activeTab, 'secondYear')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${tournamentKey === 'secondYear' ? 'bg-white/20 text-white border border-white/30' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                  >
                    2nd Year
                  </button>
                  <button
                    onClick={() => handleMenuItemClick(activeTab, 'thirdYear')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${tournamentKey === 'thirdYear' ? 'bg-white/20 text-white border border-white/30' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                  >
                    3rd Year
                  </button>
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
    </div >
  );
};

export default AdminPage;