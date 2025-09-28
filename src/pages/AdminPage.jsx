import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from '../components/Login';
import TournamentBracketViewClean from '../components/TournamentBracketViewClean';
import './AdminPage.css';

const AdminPage = () => {
  const { isAuthenticated, user, logout } = useAuth();
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
    <div className="admin-page mt-5">
      <div className="admin-header">
        <div className="admin-info">
          <h2>Tournament Administration</h2>
          <p>Welcome, {user?.username} | Edit and manage tournament brackets</p>
        </div>
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