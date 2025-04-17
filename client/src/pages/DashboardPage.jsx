// React + Tailwind: SmartClinic Dashboard Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        console.log("Fetching appointments...");
        console.log("Current user:", user);
        console.log("Token in localStorage:", localStorage.getItem('token'));
        
        const token = localStorage.getItem('token');
        if (!token) {
          console.log("No token found, redirecting to auth");
          navigate('/auth');
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/appointments`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            patientId: user?.role === 'patient' ? user?._id : undefined,
            doctorId: user?.role === 'doctor' ? user?._id : undefined
          }
        });
        console.log("Appointments fetched successfully:", response.data);
        setAppointments(response.data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        console.error("Error response:", err.response);
        setError("Failed to fetch appointments");
        if (err.response?.status === 401) {
          console.log("Unauthorized, logging out...");
          logout();
          navigate('/auth');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user, navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isAuthenticated) {
    return <div>Please log in to view the dashboard</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Time</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt._id} className="border-t">
                    <td className="p-3">{formatDate(appt.date)}</td>
                    <td className="p-3">{formatTime(appt.time)}</td>
                    <td className="p-3">{appt.status}</td>
                    <td className="p-3">
                      <button
                        onClick={() => navigate(`/appointment-confirmation/${appt._id}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/reservation")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Book New Appointment
            </button>
            <button
              onClick={() => navigate("/reminders")}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
            >
              View Reminders
            </button>
            {user?.role === 'doctor' && (
              <button
                onClick={() => navigate("/smart-scheduling")}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Smart Scheduling
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}