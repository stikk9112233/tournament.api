import { useState, useEffect } from 'react';
import { AuthContext } from './auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount (safe for SSR)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedToken) {
          setToken(savedToken);
        }
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
    } catch (err) {
      console.error('Error loading auth from localStorage', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // NOTE: login(authToken, userData)
  const login = (authToken, userData) => {
    setToken(authToken);
    setUser(userData || null);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', authToken);
        if (userData) localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('Error saving auth to localStorage', err);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (err) {
      console.error('Error clearing auth from localStorage', err);
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
