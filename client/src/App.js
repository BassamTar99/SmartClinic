import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from './context/AuthContext';
import { handleApiError } from './utils/apiErrorHandler';
import ErrorBoundary from './components/ErrorBoundary';

// Import pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AppointmentConfirmation from './pages/AppointmentConfirmation';
import ReminderTimelinePage from './pages/ReminderTimelinePage';
import SmartSchedulingPage from './pages/SmartSchedulingPage';
import ReservationPage from './pages/ReservationPage';
import AboutUsPage from './pages/AboutUsPage';

// Configure axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Add axios interceptor for handling auth token
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

function App() {
  const [user, setUser] = useState(() => {
    // Initialize user state from localStorage if available
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Initial auth check - Token from localStorage:', token);
        
        if (token) {
          console.log('Token found, setting Authorization header');
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('Making auth/me request...');
          const response = await axios.get('/auth/me');
          console.log('Auth check response:', response.data);
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } else {
          console.log('No token found in localStorage');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        console.error('Error response:', error.response);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log("Attempting login in App.js...");
      const response = await axios.post('/auth/login', { email, password });
      console.log("Login response:", response.data);
      
      const { token, user } = response.data;
      console.log("Storing token and user in localStorage");
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set the Authorization header for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log("Authorization header set:", axios.defaults.headers.common['Authorization']);
      
      // Verify the token was stored correctly
      const storedToken = localStorage.getItem('token');
      console.log("Token stored in localStorage:", storedToken);
      
      setUser(user);
      return { success: true, user };
    } catch (error) {
      console.error("Login error in App.js:", error);
      console.error("Error response:", error.response);
      
      let errorMessage = "An error occurred during login";
      if (error.response) {
        const { data, status } = error.response;
        if (status === 400) {
          errorMessage = data.message || "Invalid email or password";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later";
        }
      }
      
      setError(errorMessage);
      return { success: false, error: { message: errorMessage } };
    }
  };

  const logout = () => {
    console.log("Logging out - Clearing auth data");
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Add axios interceptor for handling 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => {
        console.log("Response received:", response.config.url);
        return response;
      },
      error => {
        console.log("Response interceptor - Error:", error);
        console.log("Error config:", error.config);
        console.log("Error response:", error.response);
        
        if (error.response && error.response.status === 401) {
          console.log("401 Unauthorized response received");
          console.log("Current token:", localStorage.getItem('token'));
          logout();
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ user, login, logout, error, setError }}>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/dashboard" />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              user ? <DashboardPage /> : <Navigate to="/auth" />
            } />
            <Route path="/appointments" element={
              user ? <AppointmentConfirmation /> : <Navigate to="/auth" />
            } />
            <Route path="/reminders" element={
              user ? <ReminderTimelinePage /> : <Navigate to="/auth" />
            } />
            <Route path="/smart-scheduling" element={
              user ? <SmartSchedulingPage /> : <Navigate to="/auth" />
            } />
            <Route path="/reservation" element={
              user ? <ReservationPage /> : <Navigate to="/auth" />
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

export default App;
