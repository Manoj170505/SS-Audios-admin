import React, { useState } from 'react';
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
    <div className="min-h-screen bg-[#141010] relative overflow-hidden">
      <style>{`
        @keyframes adminPanelArrive {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(24px);
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0);
          }
        }

        .admin-panel-enter {
          animation: adminPanelArrive 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {isAuthenticated ? (
        <div className="admin-panel-enter">
          <MediaManager onLogout={handleLogout} />
        </div>
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
};

export default App;