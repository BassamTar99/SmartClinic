// React + Tailwind for Appointment Confirmation Page

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";

export default function AppointmentConfirmation() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suggestedAppointments, setSuggestedAppointments] = useState([]);

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
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
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
          <div className="p-3 bg-red-100 text-red-700 rounded mb-4">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-center mb-6">Appointment Confirmed</h1>
        
        {appointment && (
          <div className="mb-8">
            <p className="text-center text-gray-600 mb-4">
              Your appointment with <strong>Dr. {appointment.doctor.name}</strong> is on{' '}
              <strong>{formatDate(appointment.date)} at {formatTime(appointment.time)}</strong>.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Appointment Details</h2>
              <p className="text-gray-600">
                <span className="font-medium">Location:</span> {appointment.location}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Price:</span> ${appointment.price}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Status:</span>{' '}
                <span className={`px-2 py-1 rounded ${
                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {appointment.status}
                </span>
              </p>
            </div>
          </div>
        )}

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

        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
