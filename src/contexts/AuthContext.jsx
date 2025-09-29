import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [tournamentData, setTournamentData] = useState(null);

  // Load authentication state from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('acm_tournament_auth');
    const savedTournamentData = localStorage.getItem('acm_tournament_data');
    
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setIsAuthenticated(authData.isAuthenticated);
      setUser(authData.user);
    }
    
    if (savedTournamentData) {
      setTournamentData(JSON.parse(savedTournamentData));
    }
  }, []);

  const login = async (username, password) => {
    try {
      const baseUrl = process.env.REACT_APP_SUPABASE_URL;
      if (!baseUrl) throw new Error('Supabase URL missing');
      const resp = await fetch(`${baseUrl}/functions/v1/admin_auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      const data = await resp.json();
      if (!resp.ok || !data?.success) {
        return { success: false, error: data?.error || 'Invalid credentials' };
      }

      const userData = { username: data.username || username, role: data.role || 'admin' };
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem('acm_tournament_auth', JSON.stringify({
        isAuthenticated: true,
        user: userData
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('acm_tournament_auth');
  };

  const updateTournamentData = (data) => {
    setTournamentData(data);
    localStorage.setItem('acm_tournament_data', JSON.stringify(data));
  };

  const value = {
    isAuthenticated,
    user,
    tournamentData,
    login,
    logout,
    updateTournamentData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};