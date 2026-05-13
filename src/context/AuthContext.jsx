import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, sendVerificationEmail } from '../api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    const receivedToken = data.token || data.access_token;
    const receivedUser = data.user || data.data || { email: credentials.email };

    if (receivedToken) {
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
    }
    localStorage.setItem('user', JSON.stringify(receivedUser));
    setUser(receivedUser);
    return data;
  };

  const register = async (userData) => {
    const data = await registerUser(userData);
    // Some APIs auto-login on register
    const receivedToken = data.token || data.access_token;
    const receivedUser = data.user || data.data || { email: userData.email };

    if (receivedToken) {
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
    }
    localStorage.setItem('user', JSON.stringify(receivedUser));
    setUser(receivedUser);
    return data;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      // Even if the API call fails, clear local state
      console.error('Logout API error:', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const sendVerification = async () => {
    return await sendVerificationEmail();
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    sendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
