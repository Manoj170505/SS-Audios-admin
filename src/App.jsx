import React, { useState, useEffect } from 'react';
import LoginPage from './Components/login';
import MediaManager from './Components/page';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('soundscape_admin_auth') === 'true';
  });

  const handleLoginSuccess = (credentials) => {
    localStorage.setItem('soundscape_admin_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('soundscape_admin_auth');
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-[#141010]">
      {isAuthenticated ? (
        <MediaManager onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
};

export default App;