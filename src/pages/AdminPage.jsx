import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { config } from '../config';
import Login from '../components/Login';
import TournamentBracketViewClean from '../components/TournamentBracketViewClean';
import AdminMatchManager from '../components/AdminMatchManager';
import TournamentInitializer from '../components/TournamentInitializer';
import DatabaseTestPage from '../components/DatabaseTestPage';
import './AdminPage.css';

const AdminPage = () => {
  const { isAuthenticated, logout } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(!isAuthenticated);
  const [activeTab, setActiveTab] = useState('matches');
  // Use the fixed tournament ID from config
  const tournamentId = config.TOURNAMENT_ID;

  const handleLoginSuccess = () => {
    setShowLoginForm(false);
  };

  const handleLogout = () => {
    logout();
    setShowLoginForm(true);
  };

  if (showLoginForm || !isAuthenticated) {
    return (
      <div className="admin-page">
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header bg-white shadow-sm border-b">
        <div className="flex justify-between items-center px-6 py-4">
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
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('matches')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'matches'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Match Management
            </button>
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
          </nav>
        </div>
      </div>
      
      <div className="admin-content">
        {activeTab === 'matches' && (
          <AdminMatchManager tournamentId={tournamentId} />
        )}
        
        {activeTab === 'bracket' && (
          <TournamentBracketViewClean isEditable={true} tournamentId={tournamentId} />
        )}
        
        {activeTab === 'setup' && (
          <TournamentInitializer 
            onTournamentCreated={(tournament) => {
              // Tournament ID is fixed, just switch to matches tab
              setActiveTab('matches');
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