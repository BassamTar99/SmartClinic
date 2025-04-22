import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function DoctorProfilePage() {
  console.log('DoctorProfilePage - Component rendering');
  const { user, isAuthenticated } = useAuth();
  console.log('DoctorProfilePage - Auth state:', { user, isAuthenticated });
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    specialization: '',
    qualifications: [],
    experience: '',
    consultationFee: ''
  });
  const [qualificationInput, setQualificationInput] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    console.log('DoctorProfilePage - useEffect running');
    if (!isAuthenticated) {
      console.log('DoctorProfilePage - Not authenticated, redirecting to /auth');
      navigate('/auth');
      return;
    }

    if (user?.role !== 'doctor') {
      console.log(`DoctorProfilePage - User role is ${user?.role}, not doctor. Redirecting to dashboard`);
      navigate('/dashboard');
      return;
    }

    const fetchDoctorProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log('DoctorProfilePage - Fetching profile with token:', token);
        
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/doctors/profile`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          console.log('DoctorProfilePage - Profile data received:', response.data);
          setProfile({
            specialization: response.data.specialization || '',
            qualifications: response.data.qualifications || [],
            experience: response.data.experience || '',
            consultationFee: response.data.consultationFee || ''
          });
        } catch (err) {
          console.error('Error fetching doctor profile:', err);
          // If the profile is not found (404), we'll just show an empty form
          // instead of treating it as an error, allowing the doctor to create a profile
          if (err.response && err.response.status === 404) {
            console.log('DoctorProfilePage - No profile found, showing empty form');
            // Keep default empty profile state
          } else {
            setError(err.response?.data?.message || 'Failed to fetch profile information');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('DoctorProfilePage - Unexpected error:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [user, isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };

  const handleAddQualification = () => {
    if (qualificationInput.trim() !== '') {
      setProfile({
        ...profile,
        qualifications: [...profile.qualifications, qualificationInput.trim()]
      });
      setQualificationInput('');
    }
  };

  const handleRemoveQualification = (index) => {
    setProfile({
      ...profile,
      qualifications: profile.qualifications.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/doctors/profile`,
        profile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setSuccessMessage('Profile updated successfully');
      setLoading(false);
    } catch (err) {
      console.error('Error updating doctor profile:', err);
      setError('Failed to update profile information');
      setLoading(false);
    }
  };

  if (loading) {
    console.log('DoctorProfilePage - Showing loading state');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  console.log('DoctorProfilePage - Rendering profile form');
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Doctor Profile</h1>
        
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
            <label className="block text-gray-700 mb-2" htmlFor="specialization">
              Specialization
            </label>
            <input
              type="text"
              id="specialization"
              name="specialization"
              value={profile.specialization}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded"
              placeholder="e.g., Cardiology, Neurology, Pediatrics"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Qualifications
            </label>
            <div className="mb-2 flex gap-2">
              <input
                type="text"
                value={qualificationInput}
                onChange={(e) => setQualificationInput(e.target.value)}
                className="flex-grow p-3 border border-gray-300 rounded"
                placeholder="e.g., MD, PhD, Board Certifications"
              />
              <button
                type="button"
                onClick={handleAddQualification}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            {profile.qualifications.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-2">Your qualifications:</p>
                <ul className="space-y-1">
                  {profile.qualifications.map((qual, index) => (
                    <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span>{qual}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQualification(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="experience">
              Experience (years)
            </label>
            <input
              type="number"
              id="experience"
              name="experience"
              value={profile.experience}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded"
              min="0"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="consultationFee">
              Consultation Fee
            </label>
            <div className="flex items-center">
              <span className="bg-gray-100 p-3 border border-gray-300 border-r-0 rounded-l">$</span>
              <input
                type="number"
                id="consultationFee"
                name="consultationFee"
                value={profile.consultationFee}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-r"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}