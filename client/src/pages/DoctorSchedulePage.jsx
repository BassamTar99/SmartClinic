import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function DoctorSchedulePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [doctor, setDoctor] = useState(null);
  const navigate = useNavigate();

  // This will store the doctor's availability schedule
  const [scheduleData, setScheduleData] = useState({
    Monday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    Tuesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    Wednesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    Thursday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    Friday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    Saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    Sunday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  });

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        if (!user || user.role !== 'doctor') {
          setError("Access denied. Only doctors can access this page.");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/auth');
          return;
        }

        // Fetch doctor details including availability
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/doctors/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setDoctor(response.data);
        
        // Initialize form with the doctor's existing schedule
        if (response.data.availability && response.data.availability.length > 0) {
          const initialSchedule = { ...scheduleData };
          
          response.data.availability.forEach(slot => {
            initialSchedule[slot.day] = {
              enabled: true,
              startTime: slot.startTime,
              endTime: slot.endTime
            };
          });
          
          setScheduleData(initialSchedule);
        }
      } catch (err) {
        console.error("Error fetching doctor details:", err);
        setError("Failed to fetch doctor details");
        if (err.response?.status === 401) {
          logout();
          navigate('/auth');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [user, navigate, logout]);

  const handleToggleDay = (day) => {
    setScheduleData(prevState => ({
      ...prevState,
      [day]: {
        ...prevState[day],
        enabled: !prevState[day].enabled
      }
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setScheduleData(prevState => ({
      ...prevState,
      [day]: {
        ...prevState[day],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Convert schedule data to the format expected by the API
      const availability = Object.entries(scheduleData)
        .filter(([_, value]) => value.enabled)
        .map(([day, value]) => ({
          day,
          startTime: value.startTime,
          endTime: value.endTime
        }));

      // Send the updated availability to the server
      await axios.put(`${process.env.REACT_APP_API_URL}/doctors/availability`, {
        availability
      });

      setSuccess("Schedule updated successfully");
    } catch (err) {
      console.error("Error updating schedule:", err);
      setError(err.response?.data?.message || "Failed to update schedule");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in to access this page</div>;
  }

  if (user?.role !== 'doctor') {
    return <div>Unauthorized access. This page is for doctors only.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Manage Your Schedule</h1>
          <button
            onClick={() => navigate("/doctor-dashboard")}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="mb-6 text-gray-600">
              Set your weekly availability schedule. This will determine when patients can book appointments with you.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {Object.entries(scheduleData).map(([day, { enabled, startTime, endTime }]) => (
                  <div key={day} className="flex flex-col sm:flex-row sm:items-center p-4 border rounded hover:bg-gray-50">
                    <div className="flex items-center mb-2 sm:mb-0 sm:w-1/3">
                      <input
                        type="checkbox"
                        id={`enable-${day}`}
                        checked={enabled}
                        onChange={() => handleToggleDay(day)}
                        className="mr-2 h-5 w-5 text-blue-600"
                      />
                      <label htmlFor={`enable-${day}`} className="font-medium">
                        {day}
                      </label>
                    </div>
                    
                    {enabled && (
                      <div className="flex flex-col sm:flex-row sm:w-2/3 gap-4">
                        <div className="flex-1">
                          <label htmlFor={`start-${day}`} className="block text-sm text-gray-700 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            id={`start-${day}`}
                            value={startTime}
                            onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                            className="w-full border border-gray-300 rounded p-2"
                            required={enabled}
                          />
                        </div>
                        <div className="flex-1">
                          <label htmlFor={`end-${day}`} className="block text-sm text-gray-700 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            id={`end-${day}`}
                            value={endTime}
                            onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                            className="w-full border border-gray-300 rounded p-2"
                            required={enabled}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? "Updating..." : "Update Schedule"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 