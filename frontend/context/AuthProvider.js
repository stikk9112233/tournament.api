import { useState, useEffect } from 'react';
import { AuthContext } from './auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const savedToken = localStorage.getItem('token');
          const savedUser = localStorage.getItem('user');
          
          if (savedToken) {
            setToken(savedToken);
            console.log('✅ Token loaded from localStorage:', savedToken);
          }
          if (savedUser) {
            setUser(JSON.parse(savedUser));
            console.log('✅ User loaded from localStorage');
          }
        }
      } catch (err) {
        console.error('❌ Error loading auth from localStorage', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (authToken, userData) => {
    console.log('🔐 Login called with token:', authToken);
    
    setToken(authToken);
    setUser(userData || null);
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', authToken);
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        console.log('✅ Auth saved to localStorage');
      }
    } catch (err) {
      console.error('❌ Error saving auth to localStorage', err);
    }
  };

  const logout = () => {
    console.log('🚪 Logout called');
    
    setUser(null);
    setToken(null);
    
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('✅ Auth cleared from localStorage');
      }
    } catch (err) {
      console.error('❌ Error clearing auth from localStorage', err);
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
