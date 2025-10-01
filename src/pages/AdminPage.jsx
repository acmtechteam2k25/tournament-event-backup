import React, { useState } from 'react';
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
  // Year switcher state
  const [tournamentKey, setTournamentKey] = useState(config.DEFAULT_TOURNAMENT_KEY);
  const tournamentId = config.TOURNAMENTS?.[tournamentKey]?.id || config.TOURNAMENT_ID;

  const handleLoginSuccess = () => {
    // no-op, auth is managed by context/localStorage
  };

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="admin-page pt-28">
      <div className="admin-header bg-white shadow-sm border-b">
        <div className="flex justify-between items-center px-6 gap-5">
          <h1 className="text-2xl font-bold text-gray-800">Tournament Admin</h1>
          <button 
            onClick={handleLogout} 
            className="logout-btn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200"
          >
            Logout
          </button>
        </div>
        
        {/* Admin Navigation Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8 items-end">
            <button
              onClick={() => setActiveTab('bracket')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'bracket'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bracket View
            </button>
            <button
              onClick={() => setActiveTab('setup')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'setup'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tournament Setup
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'database'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Database Status
            </button>

            {/* Year Toggle */}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setTournamentKey('secondYear')}
                className={`px-3 py-1 rounded-l border ${tournamentKey === 'secondYear' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                2nd Year
              </button>
              <button
                onClick={() => setTournamentKey('thirdYear')}
                className={`px-3 py-1 rounded-r border-t border-b border-r ${tournamentKey === 'thirdYear' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                3rd Year
              </button>
            </div>
          </nav>
        </div>
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