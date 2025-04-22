import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Helper function to determine profile URL based on user role
  const getProfileUrl = () => {
    // Make sure user and user.role are defined
    console.log('Header - Current user:', user);
    if (!user || !user.role) {
      console.log('Header - User or user.role is undefined, redirecting to dashboard');
      return '/dashboard';
    }
    console.log(`Header - User role is ${user.role}, redirecting to ${user.role === 'doctor' ? "/doctor-profile" : "/patient-profile"}`);
    return user.role === 'doctor' ? "/doctor-profile" : "/patient-profile";
  };

  // For debugging
  const handleProfileClick = (e) => {
    console.log('Profile clicked - Current auth state:', { user, isAuthenticated });
    if (!user || !user.role) {
      console.log('Warning: User or user role is missing');
      e.preventDefault();
      alert('Authentication issue detected. Check console for details.');
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                SmartClinic
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                About
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
              )}
              {isAuthenticated && user?.role === 'doctor' && (
                <Link
                  to="/doctor-schedule"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  My Schedule
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to={getProfileUrl()}
                  onClick={handleProfileClick}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Profile
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  {user?.name || user?.email}
                  {user?.role && <span className="ml-1 text-xs text-gray-500">({user.role})</span>}
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign In / Sign Up
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}