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
    // Placeholder authentication - replace with Firebase later
    const validCredentials = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'acm_admin', password: 'tournament2025', role: 'admin' }
    ];

    const validUser = validCredentials.find(
      cred => cred.username === username && cred.password === password
    );

    if (validUser) {
      const userData = { username: validUser.username, role: validUser.role };
      setIsAuthenticated(true);
      setUser(userData);
      
      // Save to localStorage
      localStorage.setItem('acm_tournament_auth', JSON.stringify({
        isAuthenticated: true,
        user: userData
      }));
      
      return { success: true };
    } else {
      return { success: false, error: 'Invalid credentials' };
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