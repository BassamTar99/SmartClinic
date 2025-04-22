// React + Tailwind implementation of SmartClinic Reservation Page + Notification Component

import { useState, useEffect } from "react";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

export default function ReservationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [formFilled, setFormFilled] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [availableDoctorTimeSlots, setAvailableDoctorTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState("");
  const [searchDoctor, setSearchDoctor] = useState("");
  const [symptomCheckerVisible, setSymptomCheckerVisible] = useState(false);

  // Get the current date and year
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Format time display (convert 24-hour format to 12-hour format)
  const formatTimeDisplay = (timeString) => {
    const hour = parseInt(timeString.split(':')[0], 10);
    return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  // Fetch available appointment times for the selected date
  useEffect(() => {
    if (selectedDate) {
      const fetchAvailableTimes = async () => {
        try {
          setLoading(true);
          const appointmentDate = new Date(currentYear, currentMonth, selectedDate);
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/appointments/available-times`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            params: { date: appointmentDate.toISOString() }
          });
          
          setAvailableDoctorTimeSlots(response.data);
          setDoctors(response.data.map(item => ({
            id: item.doctorId,
            name: item.doctorName
          })));
        } catch (err) {
          setError("Failed to fetch available times");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchAvailableTimes();
    } else {
      setAvailableDoctorTimeSlots([]);
      setDoctors([]);
    }
  }, [selectedDate, currentMonth, currentYear]);

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedTime(""); // Reset time selection when doctor changes
  };

  const handleSymptomChecker = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/symptomChecker`, {
        symptoms: description,
      });
      alert(`Recommended Doctor: ${response.data.recommendedDoctor}`);
    } catch (err) {
      console.error("Symptom checker failed", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !selectedDoctor) {
      setError("Please select date, time and doctor");
      return;
    }

    try {
      setLoading(true);
      // Create a proper date object for the selected date
      const appointmentDate = new Date(currentYear, currentMonth, selectedDate);

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/appointments`, {
        date: appointmentDate.toISOString(),
        time: selectedTime, // Already in HH:MM 24-hour format
        symptoms: description,
        notes: "Appointment requested through web interface",
        doctor: selectedDoctor.id,
        patient: user._id
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Navigate to the confirmation page
      navigate(`/appointment-confirmation/${response.data._id}`);

    } catch (err) {
      setError("Failed to schedule appointment. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchDoctor.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-100 text-gray-800">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-6 right-6 bg-white border shadow-lg rounded-lg w-80 p-4 z-50 animate-fade-in">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold">Appointment Scheduled</p>
              <p className="text-sm text-gray-600 mt-1">{notificationMessage}</p>
            </div>
            <button onClick={() => setShowNotification(false)} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-6 right-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Page Title */}
      <div className="py-4 px-6">
        <h1 className="text-2xl font-bold">Book an Appointment</h1>
      </div>

      {/* Reservation Section */}
      <main className="flex flex-col md:flex-row justify-center items-start px-4 py-4 gap-8 max-w-6xl mx-auto">
        {/* Left Panel */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/2">
          <h2 className="text-lg font-semibold mb-4">SmartClinic Inc.</h2>
          <h1 className="text-2xl font-bold mb-4">Reservation Page</h1>
          <div className="flex items-center space-x-2 mb-2">
            <span>⏱️</span>
            <span>60 min</span>
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <span>📍</span>
            <span>Space</span>
          </div>
          <label className="block mb-2 font-medium">Describe Your Symptoms</label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 mb-4"
            rows="4"
            placeholder="Please describe your symptoms in detail"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <p className="text-sm text-gray-600 mb-4">
            Select the time period in which you are available as well as the nature of the appointments you'd like to receive.
          </p>
          <label className="inline-flex items-center mb-4">
            <input
              type="checkbox"
              className="form-checkbox mr-2"
              checked={formFilled}
              onChange={() => setFormFilled(!formFilled)}
              required
            />
            <span>
              I confirm that the information provided is accurate
            </span>
          </label>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
            disabled={!formFilled || loading || !selectedDoctor || !selectedTime}
          >
            {loading ? 'Scheduling...' : 'Submit'}
          </button>
        </form>

        {/* Right Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/2">
          <h2 className="text-lg font-semibold mb-4">Select a Date & Time</h2>
          <p className="mb-2 text-sm text-gray-600">{new Date(currentYear, currentMonth).toLocaleDateString('default', { month: 'long', year: 'numeric' })}</p>
          <div className="grid grid-cols-7 gap-2 text-center text-sm mb-4">
            {[...Array(30)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setSelectedDate(i + 1)}
                className={`px-3 py-2 rounded-full ${selectedDate === i + 1 ? 'bg-blue-500 text-white' : 'hover:bg-blue-100'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          {/* Doctor Dropdown with Search */}
          <div className="mt-6 mb-4">
            <h2 className="text-lg font-semibold mb-2">Search and Select a Doctor</h2>
            <input
              type="text"
              placeholder="Search for a doctor"
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              value={searchDoctor}
              onChange={(e) => setSearchDoctor(e.target.value)}
            />
            <Select
              options={filteredDoctors.map((doctor) => ({
                value: doctor.id,
                label: doctor.name,
              }))}
              onChange={(selectedOption) =>
                handleDoctorSelect({ id: selectedOption.value, name: selectedOption.label })
              }
              placeholder="Select a doctor"
            />
          </div>

          {/* Doctor Selection */}
          {selectedDate && !loading && (
            <div className="mt-6 mb-4">
              <h2 className="text-lg font-semibold mb-2">Available Doctors</h2>
              {availableDoctorTimeSlots.length === 0 ? (
                <p className="text-gray-500">No doctors available on this day.</p>
              ) : (
                <div className="space-y-2">
                  {availableDoctorTimeSlots.map((doctorData) => (
                    <div key={doctorData.doctorId} className="border rounded p-2 hover:bg-gray-50">
                      <button
                        type="button"
                        className={`w-full text-left p-1 rounded ${selectedDoctor?.id === doctorData.doctorId ? 'bg-blue-50' : ''}`}
                        onClick={() => handleDoctorSelect({
                          id: doctorData.doctorId,
                          name: doctorData.doctorName
                        })}
                      >
                        <span className="font-medium">Dr. {doctorData.doctorName}</span>
                        <span className="text-gray-500 text-xs block">
                          {doctorData.availableTimeSlots.length} available time slots
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Time Selection */}
          {selectedDoctor && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Available Time Slots</h2>
              {loading ? (
                <p>Loading available times...</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableDoctorTimeSlots
                    .find(d => d.doctorId === selectedDoctor.id)?.availableTimeSlots
                    .map((timeSlot) => (
                      <button
                        key={timeSlot}
                        type="button"
                        onClick={() => setSelectedTime(timeSlot)}
                        className={`px-3 py-2 text-center border rounded 
                          ${selectedTime === timeSlot ? 
                            'bg-blue-500 text-white' : 
                            'hover:bg-blue-100'}`}
                      >
                        {formatTimeDisplay(timeSlot)}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
          
          <p className="text-sm text-gray-600 mb-4">
            <span role="img" aria-label="globe">🌍</span> Appointment duration: 1 hour
          </p>
        </div>
      </main>

      {/* Symptom Checker Button */}
      <button
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600"
        onClick={() => setSymptomCheckerVisible(!symptomCheckerVisible)}
      >
        Help
      </button>

      {symptomCheckerVisible && (
        <div className="fixed bottom-20 right-6 bg-white border shadow-lg rounded-lg w-80 p-4 z-50">
          <h2 className="text-lg font-semibold mb-2">Symptom Checker</h2>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2 mb-4"
            rows="4"
            placeholder="Enter your symptoms"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleSymptomChecker}
          >
            Check Symptoms
          </button>
        </div>
      )}
    </div>
  );
}
