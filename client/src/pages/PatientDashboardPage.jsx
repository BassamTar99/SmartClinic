import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PatientAppointment from '../components/PatientAppointment';

export default function PatientDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/appointments/patient/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setAppointments(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch appointments");
        setLoading(false);
        console.error(err);
      }
    };

    fetchAppointments();
  }, [user, isAuthenticated, navigate]);

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

  if (user?.role !== 'patient') {
    return <div>Unauthorized access. This dashboard is for patients only.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Patient Dashboard</h1>
          <button
            onClick={() => navigate("/reservation")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Book New Appointment
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
            <p className="text-3xl font-bold">
              {appointments.filter(a => new Date(a.date) >= new Date() && a.status !== 'cancelled').length}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Past Appointments</h2>
            <p className="text-3xl font-bold">
              {appointments.filter(a => new Date(a.date) < new Date() || a.status === 'completed').length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
            
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You don't have any appointments yet</p>
                <button
                  onClick={() => navigate("/reservation")}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Book Your First Appointment
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {appointments.map((appointment) => (
                    <PatientAppointment
                      key={appointment._id}
                      appointment={appointment}
                      onCancelSuccess={() => {
                        setAppointments(
                          appointments.filter((a) => a._id !== appointment._id)
                        );
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
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
          </div>
        </div>
      </div>
    </div>
  );
} 