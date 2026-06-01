import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('guru_edu_token');
    const savedUser = localStorage.getItem('guru_edu_user');
    if (savedToken && savedUser) {
      setIsLoggedIn(true);
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();
      if (!result.success) {
        return { success: false, message: result.message || 'Login failed' };
      }

      const { token, user } = result.data;
      setIsLoggedIn(true);
      setToken(token);
      setUser(user);
      localStorage.setItem('guru_edu_token', token);
      localStorage.setItem('guru_edu_user', JSON.stringify(user));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const result = await response.json();
      if (!result.success) {
        return { success: false, message: result.message || 'Registration failed' };
      }

      const { token, user } = result.data;
      setIsLoggedIn(true);
      setToken(token);
      setUser(user);
      localStorage.setItem('guru_edu_token', token);
      localStorage.setItem('guru_edu_user', JSON.stringify(user));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setUser(null);
    localStorage.removeItem('guru_edu_token');
    localStorage.removeItem('guru_edu_user');
  };

  const getAuthHeaders = () => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, token, loading, login, register, logout, getAuthHeaders, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
