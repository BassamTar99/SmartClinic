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

  // Define all available time slots (8 AM to 10 PM)
  const availableTimeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  // This will store the doctor's availability schedule
  const [scheduleData, setScheduleData] = useState({
    Monday: { enabled: false, timeSlots: [] },
    Tuesday: { enabled: false, timeSlots: [] },
    Wednesday: { enabled: false, timeSlots: [] },
    Thursday: { enabled: false, timeSlots: [] },
    Friday: { enabled: false, timeSlots: [] },
    Saturday: { enabled: false, timeSlots: [] },
    Sunday: { enabled: false, timeSlots: [] }
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
        const response = await axios.get('/doctors/profile', {
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
              timeSlots: slot.timeSlots || []
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
        enabled: !prevState[day].enabled,
        // Clear time slots if disabling the day
        timeSlots: !prevState[day].enabled ? [] : prevState[day].timeSlots
      }
    }));
  };

  const handleTimeSlotToggle = (day, timeSlot) => {
    setScheduleData(prevState => {
      const currentTimeSlots = prevState[day].timeSlots || [];
      let updatedTimeSlots;
      
      if (currentTimeSlots.includes(timeSlot)) {
        // Remove the time slot if already selected
        updatedTimeSlots = currentTimeSlots.filter(slot => slot !== timeSlot);
      } else {
        // Add the time slot if not already selected
        updatedTimeSlots = [...currentTimeSlots, timeSlot].sort();
      }
      
      return {
        ...prevState,
        [day]: {
          ...prevState[day],
          timeSlots: updatedTimeSlots
        }
      };
    });
  };

  const formatTimeDisplay = (timeString) => {
    const hour = parseInt(timeString.split(':')[0], 10);
    return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Convert schedule data to the format expected by the API
      const availability = Object.entries(scheduleData)
        .filter(([_, value]) => value.enabled && value.timeSlots.length > 0)
        .map(([day, value]) => ({
          day,
          timeSlots: value.timeSlots
        }));

      // Send the updated availability to the server
      await axios.put('/doctors/availability', {
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
      <div className="max-w-6xl mx-auto">
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
              Set your weekly availability schedule by selecting 1-hour time blocks from 8 AM to 10 PM. 
              This will determine when patients can book appointments with you.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {Object.entries(scheduleData).map(([day, { enabled, timeSlots }]) => (
                  <div key={day} className="p-4 border rounded hover:bg-gray-50">
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id={`enable-${day}`}
                        checked={enabled}
                        onChange={() => handleToggleDay(day)}
                        className="mr-2 h-5 w-5 text-blue-600"
                      />
                      <label htmlFor={`enable-${day}`} className="font-medium text-lg">
                        {day}
                      </label>
                    </div>
                    
                    {enabled && (
                      <div>
                        <p className="mb-2 text-sm text-gray-600">Select available time slots:</p>
                        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 gap-2">
                          {availableTimeSlots.map(timeSlot => (
                            <div key={timeSlot} className="relative">
                              <input
                                type="checkbox"
                                id={`${day}-${timeSlot}`}
                                checked={timeSlots.includes(timeSlot)}
                                onChange={() => handleTimeSlotToggle(day, timeSlot)}
                                className="sr-only"
                              />
                              <label
                                htmlFor={`${day}-${timeSlot}`}
                                className={`block p-2 text-center text-sm border rounded cursor-pointer transition-colors ${
                                  timeSlots.includes(timeSlot)
                                    ? 'bg-blue-500 text-white border-blue-600'
                                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                }`}
                              >
                                {formatTimeDisplay(timeSlot)}
                              </label>
                            </div>
                          ))}
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