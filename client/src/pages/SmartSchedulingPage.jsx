// React + Tailwind: Smart Scheduling Page
import React from 'react';
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from '../context/AuthContext';
import Select from 'react-select';

export default function SmartSchedulingPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    availability: "",
    location: "",
    symptoms: "",
    preferredDate: "",
    preferredTimes: [] // Now an array
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [matchedDoctors, setMatchedDoctors] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Time slot options (8 AM to 10 PM)
  const timeSlotOptions = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ].map(ts => ({ value: ts, label: formatTimeDisplay(ts) }));

  function formatTimeDisplay(timeString) {
    const hour = parseInt(timeString.split(':')[0], 10);
    return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  }

  if (!isAuthenticated) {
    return <div>Please log in to schedule appointments</div>;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTimeChange = (selected) => {
    setFormData({
      ...formData,
      preferredTimes: selected ? selected.map(opt => opt.value) : []
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        '/doctors/match',
        {
          ...formData,
          patientId: user._id,
          preferredTimes: formData.preferredTimes // send as array
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setMatchedDoctors(response.data.doctors);
      setShowResults(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to find matching doctors");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (doctorId) => {
    try {
      const response = await axios.post(
        '/appointments',
        {
          patient: user._id,
          doctor: doctorId,
          date: formData.preferredDate,
          time: formData.preferredTimes[0], // Book the first selected time slot
          symptoms: formData.symptoms,
          location: formData.location
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      navigate(`/appointment-confirmation/${response.data._id}`);
    } catch (err) {
      setError("Failed to book appointment. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Smart Scheduling</h1>

        <p className="text-gray-600 mb-4">
          Get matched with the right doctor effortlessly. Provide your availability, location, and symptoms.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {!showResults ? (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-1">Preferred Date</label>
                <input
                  type="date"
                  name="preferredDate"
                  className="w-full border border-gray-300 rounded p-2"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Preferred Time(s)</label>
                <Select
                  isMulti
                  options={timeSlotOptions}
                  value={timeSlotOptions.filter(opt => formData.preferredTimes.includes(opt.value))}
                  onChange={handleTimeChange}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Select preferred time(s)..."
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Your Location</label>
              <input
                type="text"
                name="location"
                placeholder="e.g., Hamra, Beirut"
                className="w-full border border-gray-300 rounded p-2"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Describe Your Symptoms</label>
              <textarea
                name="symptoms"
                placeholder="e.g., I have frequent headaches and dizziness"
                className="w-full border border-gray-300 rounded p-2"
                rows={4}
                value={formData.symptoms}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Finding Doctors..." : "Match Me with a Doctor"}
            </button>
          </form>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Matched Doctors</h2>
            {matchedDoctors.length === 0 ? (
              <p className="text-gray-600">No doctors found matching your criteria.</p>
            ) : (
              <div className="space-y-4">
                {matchedDoctors.map((doctor) => (
                  <div key={doctor._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{doctor.name}</h3>
                        <p className="text-gray-600">{doctor.specialization}</p>
                        <p className="text-sm text-gray-500">{doctor.location}</p>
                      </div>
                      <button
                        onClick={() => handleBookAppointment(doctor._id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Book Appointment
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Availability: {doctor.availability}
                      </p>
                      <p className="text-sm text-gray-600">
                        Rating: {doctor.rating}/5 ({doctor.reviews} reviews)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowResults(false)}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Back to Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
