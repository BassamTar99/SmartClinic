import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function AppointmentDetailsPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`/appointments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointment(response.data);
      } catch (err) {
        setError("Failed to fetch appointment details");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id]);

  if (!isAuthenticated) {
    return <div className="p-8">Please log in to view appointment details.</div>;
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  if (!appointment) {
    return <div className="p-8">Appointment not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <div className="bg-white rounded-lg shadow p-8 max-w-xl w-full">
        <h1 className="text-2xl font-bold mb-4">Appointment Details</h1>
        <div className="mb-4">
          <div className="mb-2"><span className="font-semibold">Date:</span> {new Date(appointment.date).toLocaleDateString()} at {appointment.time}</div>
          <div className="mb-2"><span className="font-semibold">Status:</span> {appointment.status}</div>
          <div className="mb-2"><span className="font-semibold">Doctor:</span> Dr. {appointment.doctor?.name || 'N/A'}</div>
          <div className="mb-2"><span className="font-semibold">Patient:</span> {appointment.patient?.name || 'N/A'}</div>
          {appointment.symptoms && appointment.symptoms.length > 0 && (
            <div className="mb-2"><span className="font-semibold">Symptoms:</span> {appointment.symptoms.join(', ')}</div>
          )}
          {appointment.notes && (
            <div className="mb-2"><span className="font-semibold">Notes:</span> {appointment.notes}</div>
          )}
        </div>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
}
