import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import PatientProfilePage from './pages/PatientProfilePage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor-profile"
                element={
                  <PrivateRoute>
                    <DoctorProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient-profile"
                element={
                  <PrivateRoute>
                    <PatientProfilePage />
                  </PrivateRoute>
                }
              />
              {/* Add more routes as needed */}
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;