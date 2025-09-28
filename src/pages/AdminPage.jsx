import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from '../components/Login';
import TournamentBracketViewClean from '../components/TournamentBracketViewClean';
import './AdminPage.css';

const AdminPage = () => {
  const { isAuthenticated, logout } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(!isAuthenticated);

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
      <div className="admin-header">
        
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
      
      <div className="admin-content">
        <TournamentBracketViewClean isEditable={true} />
      </div>
    </div>
  );
};

export default AdminPage;