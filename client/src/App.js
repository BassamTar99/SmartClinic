import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { handleApiError } from './utils/apiErrorHandler';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';

// Import pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import AppointmentConfirmation from './pages/AppointmentConfirmation';
import ReminderTimelinePage from './pages/ReminderTimelinePage';
import SmartSchedulingPage from './pages/SmartSchedulingPage';
import ReservationPage from './pages/ReservationPage';
import AboutUsPage from './pages/AboutUsPage';
import DoctorSchedulePage from './pages/DoctorSchedulePage';

// Configure axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log('API base URL:', axios.defaults.baseURL);

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

// Dashboard Router Component
const DashboardRouter = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  if (user?.role === 'doctor') {
    return <Navigate to="/doctor-dashboard" />;
  } else {
    return <Navigate to="/patient-dashboard" />;
  }
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to="/dashboard" />} />

            {/* Dashboard routing */}
            <Route path="/dashboard" element={<DashboardRouter />} />
            
            {/* Protected patient routes */}
            <Route path="/patient-dashboard" element={
              isAuthenticated && user?.role === 'patient' ? <PatientDashboardPage /> : <Navigate to={isAuthenticated ? "/dashboard" : "/auth"} />
            } />
            
            {/* Protected doctor routes */}
            <Route path="/doctor-dashboard" element={
              isAuthenticated && user?.role === 'doctor' ? <DoctorDashboardPage /> : <Navigate to={isAuthenticated ? "/dashboard" : "/auth"} />
            } />
            <Route path="/doctor-schedule" element={
              isAuthenticated && user?.role === 'doctor' ? <DoctorSchedulePage /> : <Navigate to={isAuthenticated ? "/dashboard" : "/auth"} />
            } />

            {/* Common protected routes */}
            <Route path="/appointments" element={
              isAuthenticated ? <AppointmentConfirmation /> : <Navigate to="/auth" />
            } />
            <Route path="/reminders" element={
              isAuthenticated ? <ReminderTimelinePage /> : <Navigate to="/auth" />
            } />
            <Route path="/smart-scheduling" element={
              isAuthenticated ? <SmartSchedulingPage /> : <Navigate to="/auth" />
            } />
            <Route path="/reservation" element={
              isAuthenticated ? <ReservationPage /> : <Navigate to="/auth" />
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
