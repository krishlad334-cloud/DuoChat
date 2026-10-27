import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('duochat_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('duochat_token'));
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('duochat_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Auth verification failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    }

    verifyAuth();

    const handleAutoLogout = () => {
      logout();
    };
    window.addEventListener('auth:logout', handleAutoLogout);
    return () => window.removeEventListener('auth:logout', handleAutoLogout);
  }, []);

  const login = async (identifier, password) => {
    const res = await authAPI.login({ identifier, password });
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('duochat_token', res.token);
      localStorage.setItem('duochat_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error(res.error || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('duochat_token', res.token);
      localStorage.setItem('duochat_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error(res.error || 'Registration failed');
  };

  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout();
      }
    } catch (e) {
      // Ignore network error on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('duochat_token');
      localStorage.removeItem('duochat_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
