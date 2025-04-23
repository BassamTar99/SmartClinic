import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function PatientProfilePage() {
  console.log('PatientProfilePage - Component rendering');
  const { user, isAuthenticated } = useAuth();
  console.log('PatientProfilePage - Auth state:', { user, isAuthenticated });
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    console.log('PatientProfilePage - useEffect running');
    if (!isAuthenticated) {
      console.log('PatientProfilePage - Not authenticated, redirecting to /auth');
      navigate('/auth');
      return;
    }

    if (user?.role !== 'patient') {
      console.log(`PatientProfilePage - User role is ${user?.role}, not patient. Redirecting to dashboard`);
      navigate('/dashboard');
      return;
    }

    // Load the current user's data
    if (user) {
      console.log('PatientProfilePage - Setting profile data from user:', user);
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
      });
    }
  }, [user, isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('PatientProfilePage - Submitting profile update:', profile);
      const token = localStorage.getItem('token');
      await axios.put(
        '/auth/profile',
        profile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('PatientProfilePage - Profile updated successfully');
      setSuccessMessage('Profile updated successfully');
    } catch (err) {
      console.error('Error updating patient profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile information');
    } finally {
      setLoading(false);
    }
  };

  console.log('PatientProfilePage - Rendering profile form');
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Patient Profile</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded"
              required
              disabled
            />
            <p className="text-sm text-gray-500 mt-1">Email address cannot be changed</p>
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="phone">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profile.phone}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded"
              placeholder="e.g., 123-456-7890"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="address">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={profile.address}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded"
              rows="3"
              placeholder="Street address, city, state, zip code"
            ></textarea>
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="dateOfBirth">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={profile.dateOfBirth}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}