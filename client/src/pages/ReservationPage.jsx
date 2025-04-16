// React + Tailwind implementation of SmartClinic Reservation Page + Notification Component

import { useState, useEffect } from "react";
import axios from 'axios';

export default function ReservationPage() {
  const [description, setDescription] = useState("");
  const [formFilled, setFormFilled] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch available appointment times
  useEffect(() => {
    if (selectedDate) {
      const fetchAvailableTimes = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/appointments/available-times`, {
            params: { date: selectedDate }
          });
          setAvailableTimes(response.data);
        } catch (err) {
          setError("Failed to fetch available times");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchAvailableTimes();
    }
  }, [selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError("Please select both date and time");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/appointments`, {
        date: selectedDate,
        time: selectedTime,
        symptoms: description,
        notes: "Appointment requested through web interface"
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setNotificationMessage("Appointment scheduled successfully!");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
      
      // Reset form
      setDescription("");
      setSelectedDate(null);
      setSelectedTime("");
      setFormFilled(false);
    } catch (err) {
      setError("Failed to schedule appointment. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-100 text-gray-800">
      {/* Navbar */}
      <header className="flex justify-between items-center px-8 py-4 bg-white shadow">
        <div className="text-xl font-bold">
          <img src="/logo.png" alt="SmartClinic Scheduler" className="h-10" />
        </div>
        <nav className="space-x-6 text-sm font-medium">
          <a href="#" className="hover:underline">Community</a>
          <a href="#" className="hover:underline">Resources</a>
          <a href="#" className="hover:underline">Contact</a>
          <button className="bg-black text-white px-4 py-1 rounded">Sign In</button>
        </nav>
      </header>

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

      {/* Reservation Section */}
      <main className="flex flex-col md:flex-row justify-center items-start px-4 py-10 gap-8 max-w-6xl mx-auto">
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
            disabled={!formFilled || loading}
          >
            {loading ? 'Scheduling...' : 'Submit'}
          </button>
        </form>

        {/* Right Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/2">
          <h2 className="text-lg font-semibold mb-4">Select a Date & Time</h2>
          <p className="mb-2 text-sm text-gray-600">April 2024</p>
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
          
          {/* Time Selection */}
          {selectedDate && (
            <div className="mb-4">
              <label className="block mb-2 font-medium">Available Times</label>
              {loading ? (
                <p>Loading available times...</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-3 py-2 rounded ${
                        selectedTime === time ? 'bg-blue-500 text-white' : 'border hover:bg-blue-100'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <p className="text-sm text-gray-600 mb-4">
            <span role="img" aria-label="globe">🌍</span> Central European Time
          </p>
          <button className="border border-gray-400 px-4 py-2 rounded hover:bg-gray-100">
            Need Help?
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-10 py-10 px-8 text-sm text-gray-600">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">SmartClinic Scheduler®</h3>
            <p>Efficient | Reliable | Patient-Centered<br/>Bringing AI-powered efficiency to healthcare scheduling.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1">
              <li><a href="#">About Us</a></li>
              <li><a href="#">How It Works</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Features</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Contact Us</h4>
            <p>Email: support@smartclinic.com</p>
            <p>Phone: +961 00000000</p>
            <p>Location: Beirut, Hamra</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
