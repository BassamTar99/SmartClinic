import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function DoctorDashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        console.log("Fetching doctor appointments...");
        
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
            doctorId: user?._id
          }
        });
        console.log("Doctor appointments fetched successfully:", response.data);
        setAppointments(response.data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
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

  if (user?.role !== 'doctor') {
    return <div>Unauthorized access. This dashboard is for doctors only.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Today's Appointments</h2>
            <p className="text-3xl font-bold">
              {appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Pending Appointments</h2>
            <p className="text-3xl font-bold">
              {appointments.filter(a => a.status === 'pending').length}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Total Patients</h2>
            <p className="text-3xl font-bold">
              {new Set(appointments.map(a => a.patient)).size}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
              <button
                onClick={() => navigate("/doctor-schedule")}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Manage Schedule
              </button>
            </div>
            
            {appointments.length === 0 ? (
              <p className="text-gray-500">No appointments scheduled</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3">Patient</th>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Time</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {appointments.map((appt) => (
                      <tr key={appt._id} className="hover:bg-gray-50">
                        <td className="p-3">{appt.patient.name}</td>
                        <td className="p-3">{formatDate(appt.date)}</td>
                        <td className="p-3">{formatTime(appt.time)}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            appt.status === 'completed' ? 'bg-green-100 text-green-800' :
                            appt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appt.status}
                          </span>
                        </td>
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
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/doctor-schedule")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Update Schedule
            </button>
            <button
              onClick={() => navigate("/smart-scheduling")}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
            >
              Smart Scheduling
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 