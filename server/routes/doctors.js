const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const { predictDisease } = require('../utils/symptomCheckerUtils');

// Get the authenticated doctor's profile
router.get('/profile', auth, async (req, res) => {
  try {
    // Make sure the user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Not a doctor account.' });
    }

    // Find the doctor document associated with this user
    const doctor = await Doctor.findOne({ user: req.user.userId })
      .populate('user', 'name email');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update doctor profile
router.post('/profile', auth, async (req, res) => {
  try {
    // Make sure the user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Not a doctor account.' });
    }

    const { specialization, qualifications, experience, consultationFee } = req.body;

    // Find existing doctor profile or create new one
    let doctor = await Doctor.findOne({ user: req.user.userId });

    if (doctor) {
      // Update existing doctor
      doctor.specialization = specialization;
      doctor.qualifications = qualifications;
      doctor.experience = experience;
      doctor.consultationFee = consultationFee;
    } else {
      // Create new doctor profile
      doctor = new Doctor({
        user: req.user.userId,
        specialization,
        qualifications,
        experience,
        consultationFee,
        availability: []
      });
    }

    await doctor.save();
    res.json(doctor);
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update doctor availability
router.put('/availability', auth, async (req, res) => {
  try {
    // Make sure the user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Not a doctor account.' });
    }

    const { availability } = req.body;

    // Check if availability data is valid
    if (!Array.isArray(availability)) {
      return res.status(400).json({ message: 'Availability must be an array' });
    }

    // Valid time slots (8 AM to 10 PM in 1-hour blocks)
    const validTimeSlots = [
      '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
      '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
    ];

    // Validate each availability slot
    for (const slot of availability) {
      if (!slot.day || !slot.timeSlots || !Array.isArray(slot.timeSlots)) {
        return res.status(400).json({ 
          message: 'Each availability slot must have day and timeSlots array' 
        });
      }
      
      // Validate day of week
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      if (!validDays.includes(slot.day)) {
        return res.status(400).json({ message: 'Invalid day of week' });
      }

      // Validate time slots
      for (const timeSlot of slot.timeSlots) {
        if (!validTimeSlots.includes(timeSlot)) {
          return res.status(400).json({ 
            message: `Invalid time slot: ${timeSlot}. Time slots must be on the hour from 08:00 to 22:00` 
          });
        }
      }
    }

    // Find doctor and update availability
    let doctor = await Doctor.findOne({ user: req.user.userId });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found. Please create a profile first.' });
    }

    doctor.availability = availability;
    await doctor.save();

    res.json({ 
      message: 'Availability updated successfully',
      availability: doctor.availability 
    });
  } catch (error) {
    console.error('Error updating doctor availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor availability for a specific date range
router.get('/:id/availability', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const doctorId = req.params.id;

    // Validate input
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    // Convert string dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date range
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Find the doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Find all appointments for this doctor in the date range
    const existingAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' }, // Exclude cancelled appointments
    }).select('date time');

    // Create a map of booked slots for quick lookup
    const bookedSlots = {};
    existingAppointments.forEach(appointment => {
      const dateKey = appointment.date.toISOString().split('T')[0];
      if (!bookedSlots[dateKey]) {
        bookedSlots[dateKey] = [];
      }
      bookedSlots[dateKey].push(appointment.time);
    });

    // Calculate the available days and time slots in the date range
    const availableDays = [];
    const bookedSlotsResult = [];
    
    // Loop through each day in the date range
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getDay()];
      
      // Find the availability for this day of the week
      const dayAvailability = doctor.availability.find(a => a.day === dayOfWeek);
      
      if (dayAvailability && dayAvailability.timeSlots.length > 0) {
        // This day has available slots in the doctor's schedule
        const dateString = currentDate.toISOString().split('T')[0];
        
        // Add to available days
        availableDays.push(dateString);
        
        // Calculate booked slots for this day
        const dayBookedSlots = bookedSlots[dateString] || [];
        if (dayBookedSlots.length > 0) {
          bookedSlotsResult.push({
            date: dateString,
            doctorId: doctor._id,
            bookedTimes: dayBookedSlots
          });
        }
      }
      
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Return the results
    res.json({
      doctorId: doctor._id,
      doctorName: doctor.user.name, // This will be populated if you run .populate('user')
      availableDays: availableDays,
      bookedSlots: bookedSlotsResult
    });
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Match doctors based on preferred date, times, and symptoms (location ignored for now)
router.post('/match', auth, async (req, res) => {
  try {
    const { preferredDate, preferredTimes, symptoms } = req.body;
    if (!preferredDate || !Array.isArray(preferredTimes) || preferredTimes.length === 0) {
      return res.status(400).json({ message: 'preferredDate and preferredTimes[] are required' });
    }

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ message: 'Symptoms are required' });
    }

    // Predict the disease and get the required specialties
    const diseasePrediction = await predictDisease(symptoms);
    const requiredSpecialties = diseasePrediction.doctor_recommendation.specialist.split(',').map(s => s.trim());

    // Find all doctors
    const doctors = await Doctor.find().populate('user', 'name email');
    const dateObj = new Date(preferredDate);
    const dayOfWeek = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ][dateObj.getDay()];
    const dateString = dateObj.toISOString().split('T')[0];

    // Find all appointments for the preferred date
    const appointments = await Appointment.find({
      date: dateString,
      status: { $ne: 'cancelled' }
    });

    // Build a map: { doctorId: [bookedTime, ...] }
    const bookedMap = {};
    appointments.forEach(appt => {
      const docId = appt.doctor.toString();
      if (!bookedMap[docId]) bookedMap[docId] = [];
      bookedMap[docId].push(appt.time);
    });

    // Filter doctors who match the specialties and are available for at least one requested time
    const matchedDoctors = doctors.filter(doctor => {
      if (!requiredSpecialties.includes(doctor.specialization)) return false;

      const avail = doctor.availability.find(a => a.day === dayOfWeek);
      if (!avail || !avail.timeSlots || avail.timeSlots.length === 0) return false;

      // Find at least one preferred time that is in doctor's available slots and not booked
      return preferredTimes.some(time =>
        avail.timeSlots.includes(time) &&
        !(bookedMap[doctor._id.toString()] || []).includes(time)
      );
    });

    res.json({
      diseasePrediction,
      doctors: matchedDoctors
    });
  } catch (error) {
    console.error('Error matching doctors:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name email');
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;