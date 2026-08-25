import React, { useState } from 'react';
import LoginPage from './Components/login';
import MediaManager from './Components/page';
import AdminIntroLoader from './Components/AdminIntroLoader';

const App = () => {
  const [isIntroActive, setIsIntroActive] = useState(true);
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
    <div className="min-h-screen bg-[#141010] relative overflow-hidden">
      {/* 1. Cinematic Startup Retro Wave & Audio Visualizer Intro Animation */}
      {isIntroActive && (
        <AdminIntroLoader onComplete={() => setIsIntroActive(false)} />
      )}

      {/* 2. Main Admin App Surface (Smoothly Appears after Intro Kickstart) */}
      <div
        className={`transition-all duration-1000 transform ${
          isIntroActive
            ? 'opacity-0 scale-95 pointer-events-none'
            : 'opacity-100 scale-100'
        }`}
      >
        {isAuthenticated ? (
          <MediaManager onLogout={handleLogout} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </div>
  );
};

export default App;