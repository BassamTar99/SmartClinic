import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function AppointmentConfirmation() {
  const { user, isAuthenticated } = useAuth();
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/auth');
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/appointments/${appointmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAppointment(response.data);
      } catch (err) {
        console.error("Error fetching appointment:", err);
        setError("Failed to fetch appointment details");
        if (err.response?.status === 401) {
          navigate('/auth');
        }
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId, navigate]);

  if (!isAuthenticated) {
    return <div>Please log in to view appointment details</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">Appointment Not Found</h1>
            <p>The requested appointment could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Appointment Confirmation</h1>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h2 className="font-semibold text-gray-600">Date</h2>
                <p>{new Date(appointment.date).toLocaleDateString()}</p>
              </div>
              <div>
                <h2 className="font-semibold text-gray-600">Time</h2>
                <p>{new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-gray-600">Doctor</h2>
              <p>{appointment.doctor?.name || 'Not assigned'}</p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-600">Patient</h2>
              <p>{appointment.patient?.name || 'Not assigned'}</p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-600">Status</h2>
              <p className={`inline-block px-2 py-1 rounded ${
                appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </p>
            </div>

            {appointment.notes && (
              <div>
                <h2 className="font-semibold text-gray-600">Notes</h2>
                <p className="whitespace-pre-wrap">{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 