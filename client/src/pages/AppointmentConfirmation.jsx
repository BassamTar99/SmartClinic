// React + Tailwind for Appointment Confirmation Page

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from '../context/AuthContext';

export default function AppointmentConfirmation() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suggestedAppointments, setSuggestedAppointments] = useState([]);
  const [doctorName, setDoctorName] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/appointments/${appointmentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setAppointment(response.data);

        // Fetch suggested appointments
        const suggestedResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/appointments/suggested`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            params: {
              doctorId: response.data.doctor._id,
              patientId: user._id
            }
          }
        );
        setSuggestedAppointments(suggestedResponse.data);
      } catch (err) {
        setError("Failed to fetch appointment details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, user]);

  useEffect(() => {
    // Generate available slots from 8 AM to 4 PM in 1-hour intervals
    const slots = [];
    for (let hour = 8; hour <= 16; hour++) {
      const time = `${hour}:00`;
      slots.push(time);
    }
    setAvailableSlots(slots);
  }, []);

  const handleReschedule = async (newAppointmentId) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/appointments/${appointmentId}/reschedule`,
        { newAppointmentId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      navigate(`/appointment-confirmation/${newAppointmentId}`);
    } catch (err) {
      setError("Failed to reschedule appointment");
      console.error(err);
    }
  };

  const handleDoctorSelection = (e) => {
    setDoctorName(e.target.value);
  };

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
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
          <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error}</div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
          <h1 className="text-2xl font-bold text-center mb-6">Appointment Not Found</h1>
          <p className="text-center text-gray-600">This appointment could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-center mb-6">Appointment Confirmed</h1>
        
        <div className="mb-8">
          <p className="text-center text-gray-600 mb-4">
            Your appointment with <strong>Dr. {appointment?.doctor?.name || doctorName}</strong> is scheduled for{' '}
            <strong>{formatDate(appointment?.date)} at {formatTime(appointment?.time)}</strong>.
          </p>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Appointment Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="doctorName" className="block text-gray-700 font-medium mb-2">Select Doctor</label>
                <input
                  type="text"
                  id="doctorName"
                  value={doctorName}
                  onChange={handleDoctorSelection}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Enter doctor's name"
                />
              </div>

              <div>
                <label htmlFor="availableSlots" className="block text-gray-700 font-medium mb-2">Available Slots</label>
                <select
                  id="availableSlots"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  {availableSlots.map((slot, index) => (
                    <option key={index} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            {appointment.symptoms && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700 mb-2">Symptoms</h3>
                <p className="text-gray-600">{appointment.symptoms}</p>
              </div>
            )}

            {appointment.notes && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700 mb-2">Notes</h3>
                <p className="text-gray-600">{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>

        {suggestedAppointments.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Alternative Time Slots</h2>
            <p className="text-sm text-gray-600 mb-4">
              If this time doesn't work for you, here are some alternative slots:
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border">Date</th>
                    <th className="p-3 border">Time</th>
                    <th className="p-3 border">Price</th>
                    <th className="p-3 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {suggestedAppointments.map((appt) => (
                    <tr key={appt._id} className="hover:bg-gray-50">
                      <td className="p-3 border">{formatDate(appt.date)}</td>
                      <td className="p-3 border">{formatTime(appt.time)}</td>
                      <td className="p-3 border">${appt.price}</td>
                      <td className="p-3 border">
                        <button
                          onClick={() => handleReschedule(appt._id)}
                          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                        >
                          Reschedule
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">System Checker & Doctor Recommendation</h2>
          <p className="text-sm text-gray-600 mb-4">
            Use our system checker to analyze symptoms and get doctor recommendations.
          </p>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => navigate('/symptom-checker')}
          >
            Go to System Checker
          </button>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
