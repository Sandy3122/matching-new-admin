
import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/components/Dashboard';
import { getAuthToken } from '@/lib/api/config';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in with valid token
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rememberMe');
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
};

export default Index;
