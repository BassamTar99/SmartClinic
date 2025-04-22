import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Auth check - Token found in localStorage:', token);
      axios.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          console.log('Auth check success - User data:', response.data);
          setUser(response.data);
        })
        .catch(error => {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.log('Auth check - No token found in localStorage');
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Login attempt with email:', email);
      const response = await axios.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user._id);
      console.log('Token and userId stored in localStorage. User:', user);
      setUser(user);
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: { message: error.response?.data?.message || 'Login failed' }
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Registration attempt with data:', userData);
      const response = await axios.post('/auth/register', userData);
      console.log('Registration response:', response.data);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user._id);
      setUser(user);
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: { message: error.response?.data?.message || 'Registration failed' }
      };
    }
  };

  const logout = () => {
    console.log('Logging out - Clearing auth data');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};