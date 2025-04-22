import React, { useState } from 'react';
import axios from 'axios';

export default function PatientAppointment({ appointment, onCancelSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Ensure time string has the HH:MM format
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      setLoading(true);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/appointments/${appointment._id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      onCancelSuccess();
    } catch (err) {
      console.error(err);
      setError('Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-semibold">Dr. {appointment.doctor?.name || 'N/A'}</h3>
          <p className="text-gray-600">
            {formatDate(appointment.date)} at {formatTime(appointment.time)}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${
          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {appointment.status !== 'cancelled' && (
        <button
          onClick={handleCancel}
          disabled={loading}
          className="mt-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Cancelling...' : 'Cancel'}
        </button>
      )}
    </div>
  );
}