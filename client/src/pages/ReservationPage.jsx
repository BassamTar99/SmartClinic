// React + Tailwind implementation of SmartClinic Reservation Page + Notification Component

import { useState, useEffect } from "react";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select'; // Import for searchable dropdown

export default function ReservationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [formFilled, setFormFilled] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDoctors, setSelectedDoctors] = useState([]); // Array of doctor IDs
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage] = useState("");
  const [availableDoctorTimeSlots, setAvailableDoctorTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorsError, setDoctorsError] = useState("");
  const [showSymptomsBox, setShowSymptomsBox] = useState(false);
  const [availableDays, setAvailableDays] = useState({}); // Track available days for selected doctors
  const [bookedTimeSlots, setBookedTimeSlots] = useState({}); // Track booked time slots
  const [selectedDoctorForTimeSlot, setSelectedDoctorForTimeSlot] = useState(null);
  const [doctorColors, setDoctorColors] = useState({});
  const [reservationConfirmed, setReservationConfirmed] = useState(false);
  const [confirmedAppointmentId, setConfirmedAppointmentId] = useState(null);

  // Get the current date and year
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Format time display (convert 24-hour format to 12-hour format)
  const formatTimeDisplay = (timeString) => {
    const hour = parseInt(timeString.split(':')[0], 10);
    return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  // Generate a unique color for each doctor
  useEffect(() => {
    if (doctors.length > 0) {
      // Create a color palette for doctors
      const colors = {};
      const colorOptions = [
        'bg-blue-200 border-blue-500',
        'bg-green-200 border-green-500',
        'bg-purple-200 border-purple-500',
        'bg-pink-200 border-pink-500',
        'bg-yellow-200 border-yellow-500',
        'bg-indigo-200 border-indigo-500',
        'bg-red-200 border-red-500',
        'bg-teal-200 border-teal-500'
      ];
      
      doctors.forEach((doctor, index) => {
        colors[doctor.id] = colorOptions[index % colorOptions.length];
      });
      
      setDoctorColors(colors);
    }
  }, [doctors]);

  // Fetch all doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setDoctorsLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/doctors`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Transform the response to the format we need
        const doctorsData = response.data.map(doctor => ({
          id: doctor._id,
          name: doctor.user.name,
          specialization: doctor.specialization
        }));
        
        setDoctors(doctorsData);
      } catch (err) {
        setDoctorsError("Failed to fetch doctors");
        console.error(err);
      } finally {
        setDoctorsLoading(false);
      }
    };
    
    fetchDoctors();
  }, []);

  // Fetch available days for selected doctors
  useEffect(() => {
    if (selectedDoctors.length > 0) {
      const fetchDoctorAvailability = async () => {
        try {
          setLoading(true);
          const firstDay = new Date(viewYear, viewMonth, 1);
          const lastDay = new Date(viewYear, viewMonth + 1, 0);
          const doctorsAvailability = {};
          const bookedSlots = {};
          for (const doctorId of selectedDoctors) {
            const response = await axios.get(
              `${process.env.REACT_APP_API_URL}/doctors/${doctorId}/availability`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                params: {
                  startDate: firstDay.toISOString(),
                  endDate: lastDay.toISOString()
                }
              }
            );
            if (response.data && Array.isArray(response.data.availableDays)) {
              response.data.availableDays.forEach(dayString => {
                // Use the ISO date string as the key
                if (!doctorsAvailability[dayString]) {
                  doctorsAvailability[dayString] = new Set();
                }
                doctorsAvailability[dayString].add(doctorId);
              });
              if (Array.isArray(response.data.bookedSlots)) {
                response.data.bookedSlots.forEach(slot => {
                  const slotDate = slot.date; // already ISO string
                  const bookedTimes = slot.bookedTimes || [];
                  if (bookedTimes.length > 0) {
                    if (!bookedSlots[slotDate]) {
                      bookedSlots[slotDate] = {};
                    }
                    if (!bookedSlots[slotDate][doctorId]) {
                      bookedSlots[slotDate][doctorId] = [];
                    }
                    bookedSlots[slotDate][doctorId].push(...bookedTimes);
                  }
                });
              }
            }
          }
          // Convert Sets to arrays for each date string
          const availableDaysResult = {};
          Object.keys(doctorsAvailability).forEach(dateStr => {
            availableDaysResult[dateStr] = Array.from(doctorsAvailability[dateStr]);
          });
          setAvailableDays(availableDaysResult);
          setBookedTimeSlots(bookedSlots);
          // Reset selected date and time if they're no longer valid
          const selectedDateObj = selectedDate ? new Date(viewYear, viewMonth, selectedDate) : null;
          const selectedDateStr = selectedDateObj ? selectedDateObj.toISOString().split('T')[0] : null;
          if (selectedDateStr && !availableDaysResult[selectedDateStr]) {
            setSelectedDate(null);
            setSelectedTime("");
          }
        } catch (err) {
          setError("Failed to fetch doctor availability");
          console.error("API Error:", err.response?.data || err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchDoctorAvailability();
    } else {
      setAvailableDays({});
      setBookedTimeSlots({});
      setSelectedDate(null);
      setSelectedTime("");
    }
  }, [selectedDoctors, viewMonth, viewYear, selectedDate]);

  // Fetch available appointment times for the selected date
  useEffect(() => {
    if (selectedDate && selectedDoctors.length > 0) {
      const fetchAvailableTimes = async () => {
        try {
          setLoading(true);
          // Use viewMonth and viewYear instead of currentMonth and currentYear
          const appointmentDate = new Date(viewYear, viewMonth, selectedDate);
          
          // Create an array to store all doctor time slots
          let allDoctorTimeSlots = [];
          
          // Fetch available times for each doctor separately
          for (const doctorId of selectedDoctors) {
            const response = await axios.get(
              `${process.env.REACT_APP_API_URL}/appointments/available-times`, 
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                params: {
                  date: appointmentDate.toISOString(),
                  doctorId: doctorId
                }
              }
            );
            
            // The response is an array of doctor availability objects
            if (Array.isArray(response.data) && response.data.length > 0) {
              // Get the first (and likely only) doctor response
              const doctorData = response.data[0];
              
              // Add to our collection
              allDoctorTimeSlots.push({
                doctorId: doctorData.doctorId,
                doctorName: doctorData.doctorName,
                availableTimeSlots: doctorData.availableTimeSlots || []
              });
              
              console.log(`Fetched slots for doctor ${doctorData.doctorName}:`, doctorData.availableTimeSlots);
            }
          }
          
          console.log('All doctor time slots:', allDoctorTimeSlots);
          setAvailableDoctorTimeSlots(allDoctorTimeSlots);
          
          // Clear selected time if it's no longer available
          const allAvailableTimes = new Set();
          allDoctorTimeSlots.forEach(doctorSlot => {
            doctorSlot.availableTimeSlots.forEach(slot => {
              allAvailableTimes.add(slot);
            });
          });
          
          if (selectedTime && !allAvailableTimes.has(selectedTime)) {
            setSelectedTime("");
          }
          
        } catch (err) {
          setError("Failed to fetch available times");
          console.error("API Error:", err.response?.data || err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchAvailableTimes();
    } else {
      setAvailableDoctorTimeSlots([]);
    }
  }, [selectedDate, selectedDoctors, viewMonth, viewYear]);

  const handleDoctorChange = (selectedOptions) => {
    if (selectedOptions) {
      // Extract doctor IDs from the selected options
      const doctorIds = selectedOptions.map(option => option.value);
      setSelectedDoctors(doctorIds);
    } else {
      setSelectedDoctors([]);
    }
    // Reset time selection when doctors change
    setSelectedTime("");
  };

  const isDayAvailable = (day) => {
    if (selectedDoctors.length === 0) return false;
    const currentDate = new Date();
    const isViewingCurrentMonth = viewMonth === currentDate.getMonth() && viewYear === currentDate.getFullYear();
    if (isViewingCurrentMonth && day < currentDate.getDate()) return false;
    // Build the date string for this cell
    const dateObj = new Date(viewYear, viewMonth, day);
    const dateStr = dateObj.toISOString().split('T')[0];
    return availableDays[dateStr] && availableDays[dateStr].some(doctorId => 
      selectedDoctors.includes(doctorId)
    );
  };

  const isTimeSlotAvailable = (timeSlot) => {
    return availableDoctorTimeSlots.some(doctorSlot => 
      selectedDoctors.includes(doctorSlot.doctorId) && 
      doctorSlot.availableTimeSlots.includes(timeSlot)
    );
  };

  const handleTimeSlotSelect = (timeSlot, doctorId) => {
    setSelectedTime(timeSlot);
    setSelectedDoctorForTimeSlot(doctorId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || selectedDoctors.length === 0) {
      setError("Please select date, time and at least one doctor");
      return;
    }

    try {
      setLoading(true);
      // Create a proper date object for the selected date
      const appointmentDate = new Date(viewYear, viewMonth, selectedDate);

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/appointments`, {
        date: appointmentDate.toISOString(),
        time: selectedTime, // Already in HH:MM 24-hour format
        symptoms: showSymptomsBox ? description : "", // Only include symptoms if box was shown and filled
        notes: "Appointment requested through web interface",
        doctor: selectedDoctorForTimeSlot || selectedDoctors[0], // Use specifically selected doctor or default to first
        patient: user._id
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Show confirmation message instead of navigating
      setReservationConfirmed(true);
      setConfirmedAppointmentId(response.data._id);

    } catch (err) {
      setError("Failed to schedule appointment. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const doctorOptions = doctors.map(doctor => ({
    value: doctor.id,
    label: `Dr. ${doctor.name} (${doctor.specialization})`
  }));

  if (reservationConfirmed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-blue-100">
        <div className="bg-white p-8 rounded-xl shadow text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-green-700">Reservation Confirmed!</h2>
          <p className="mb-4">Your appointment has been successfully scheduled.</p>
          <div className="flex flex-col gap-2">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => navigate(`/appointment-confirmation/${confirmedAppointmentId}`)}
            >
              View Appointment Details
            </button>
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center space-x-2 mb-4">
            <span>📍</span>
            <span>Space</span>
          </div>
          
          {/* Toggle button for symptoms */}
          <button
            type="button"
            onClick={() => setShowSymptomsBox(!showSymptomsBox)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 focus:outline-none"
          >
            <span className="mr-2">{showSymptomsBox ? '−' : '+'}</span>
            <span>Describe Your Symptoms (optional)</span>
          </button>
          
          {/* Symptoms box (conditionally rendered) */}
          {showSymptomsBox && (
            <div className="mb-4 transition-all duration-200">
              <textarea
                className="w-full border border-gray-300 rounded-md p-2"
                rows="4"
                placeholder="Please describe your symptoms in detail"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Your description helps doctors prepare for your appointment.
              </p>
            </div>
          )}
          
          <p className="text-sm text-gray-600 mb-4">
            Select the time period in which you are available as well as the nature of the appointments you'd like to receive.
          </p>
          <div className="flex flex-col w-full mb-4">
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
              disabled={!formFilled || loading || selectedDoctors.length === 0 || !selectedTime}
            >
              {loading ? 'Scheduling...' : 'Submit'}
            </button>
          </div>
        </form>

        {/* Right Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/2">
          <h2 className="text-lg font-semibold mb-2">Select Doctors</h2>
          {doctorsLoading ? (
            <p className="text-gray-500">Loading doctors...</p>
          ) : doctorsError ? (
            <p className="text-red-500">{doctorsError}</p>
          ) : (
            <div className="mb-6">
              <Select
                isMulti
                options={doctorOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Search and select doctors..."
                onChange={handleDoctorChange}
                isLoading={doctorsLoading}
                isDisabled={doctorsLoading}
              />
              {selectedDoctors.length === 0 && (
                <p className="text-amber-600 text-sm mt-1">
                  Please select at least one doctor to see available dates
                </p>
              )}
            </div>
          )}

          {/* Calendar Selection */}
          <h2 className="text-lg font-semibold mb-2">Select a Date</h2>
          <div className="flex justify-between items-center mb-2">
            <button 
              type="button"
              onClick={() => {
                if (viewMonth === 0) {
                  setViewMonth(11);
                  setViewYear(viewYear - 1);
                } else {
                  setViewMonth(viewMonth - 1);
                }
                setSelectedDate(null);
                setSelectedTime("");
              }}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Previous month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 01-1.414 1.414l-4-4a1 1 010-1.414l4-4a1 1 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <p className="text-sm text-gray-600 font-medium">
              {new Date(viewYear, viewMonth).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            </p>
            
            <button 
              type="button"
              onClick={() => {
                if (viewMonth === 11) {
                  setViewMonth(0);
                  setViewYear(viewYear + 1);
                } else {
                  setViewMonth(viewMonth + 1);
                }
                setSelectedDate(null);
                setSelectedTime("");
              }}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Next month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 01-1.414-1.414l4 4a1 1 010 1.414l-4 4a1 1 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-sm mb-4">
            {[...Array(7)].map((_, i) => (
              <div key={`day-${i}`} className="font-medium py-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][i]}
              </div>
            ))}
            
            {/* Generate calendar days with proper offset for current month */}
            {(() => {
              const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0 for Sunday
              const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
              
              // Create array for all calendar cells (previous month padding + current month)
              const calendarCells = [];
              
              // Add empty cells for days before the 1st of the month
              for (let i = 0; i < firstDay; i++) {
                calendarCells.push(
                  <div key={`empty-${i}`} className="h-8"></div>
                );
              }
              
              // Add cells for each day of the current month
              for (let i = 1; i <= daysInMonth; i++) {
                const isAvailable = isDayAvailable(i);
                
                calendarCells.push(
                  <button
                    key={i}
                    type="button"
                    onClick={() => isAvailable ? setSelectedDate(i) : null}
                    className={`h-8 w-8 rounded-full mx-auto flex items-center justify-center
                      ${selectedDate === i ? 'bg-blue-500 text-white' : 
                        isAvailable ? 'hover:bg-blue-100' : 
                        'text-gray-400 bg-gray-100 cursor-not-allowed'}`}
                    disabled={!isAvailable}
                  >
                    {i}
                  </button>
                );
              }
              
              return calendarCells;
            })()}
          </div>

          {selectedDate && selectedDoctors.length > 0 && (
            <div className="mb-4">
              {/* Time Slot Selection */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Available Time Slots</h3>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : availableDoctorTimeSlots.length === 0 ? (
                  <p className="text-gray-500">No available time slots for the selected date.</p>
                ) : (
                  <>
                    {console.log('Rendering time slots:', availableDoctorTimeSlots)}
                    <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-6">
                      {(() => {
                        // Create doctor-specific time slots instead of merging them
                        const doctorTimeSlotPairs = [];
                        
                        // For each doctor, create a separate entry for each of their time slots
                        availableDoctorTimeSlots.forEach(doctorSlot => {
                          const doctor = doctors.find(d => d.id === doctorSlot.doctorId);
                          if (doctor && Array.isArray(doctorSlot.availableTimeSlots)) {
                            doctorSlot.availableTimeSlots.forEach(timeSlot => {
                              doctorTimeSlotPairs.push({
                                doctorId: doctorSlot.doctorId,
                                doctorName: `Dr. ${doctor.name}`,
                                timeSlot: timeSlot
                              });
                            });
                          }
                        });
                        
                        console.log('Doctor-specific time slots:', doctorTimeSlotPairs);
                        
                        if (doctorTimeSlotPairs.length === 0) {
                          return <p className="col-span-full text-center text-gray-500">No time slots available for selected doctors on this date.</p>;
                        }
                        
                        // Sort by time first, then by doctor name
                        doctorTimeSlotPairs.sort((a, b) => {
                          if (a.timeSlot !== b.timeSlot) {
                            return a.timeSlot.localeCompare(b.timeSlot);
                          }
                          return a.doctorName.localeCompare(b.doctorName);
                        });
                        
                        return doctorTimeSlotPairs.map((pair, index) => {
                          const { doctorId, doctorName, timeSlot } = pair;
                          
                          return (
                            <div 
                              key={`${doctorId}-${timeSlot}-${index}`}
                              className={`relative p-3 text-center border rounded cursor-pointer hover:bg-gray-50 transition-all
                                ${selectedTime === timeSlot && selectedDoctorForTimeSlot === doctorId ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                              onClick={() => handleTimeSlotSelect(timeSlot, doctorId)}
                            >
                              <div className="font-medium">{formatTimeDisplay(timeSlot)}</div>
                              
                              {/* Single doctor indicator */}
                              <div className="mt-2 flex justify-center">
                                <div
                                  className={`${doctorColors[doctorId]} w-4 h-4 rounded-full border`}
                                  title={doctorName}
                                />
                              </div>
                              
                              {/* Doctor name */}
                              <div className="mt-1 text-xs text-gray-600 truncate" title={doctorName}>
                                {doctorName}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </>
                )}
              </div>

              {/* Doctor Legend */}
              <div className="mt-4 p-3 border rounded bg-gray-50">
                <h4 className="font-medium text-sm mb-2">Doctor Legend:</h4>
                <div className="flex flex-wrap items-center gap-3">
                  {doctors.filter(d => selectedDoctors.includes(d.id)).map(doctor => (
                    <div key={doctor.id} className="flex items-center">
                      <span className={`${doctorColors[doctor.id]} w-4 h-4 inline-block rounded-full mr-2 border`}></span>
                      <span className="text-sm">Dr. {doctor.name}</span>
                    </div>
                  ))}
                </div>
              </div>
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
