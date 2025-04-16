const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');

// Get all appointments (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { patientId, doctorId, status, date } = req.query;
    const query = {};

    if (patientId) query.patient = patientId;
    if (doctorId) query.doctor = doctorId;
    if (status) query.status = status;
    if (date) query.date = new Date(date);

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort({ date: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new appointment
router.post('/', auth, async (req, res) => {
  try {
    const { patient, doctor, date, time, symptoms, notes } = req.body;

    const appointment = new Appointment({
      patient,
      doctor,
      date,
      time,
      symptoms,
      notes
    });

    await appointment.save();

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available appointment times
router.get('/available-times', auth, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    // Get all doctors' availability for the given day
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const doctors = await Doctor.find({
      'availability.day': dayOfWeek
    });

    // Generate time slots based on doctors' availability
    const timeSlots = [];
    doctors.forEach(doctor => {
      const availability = doctor.availability.find(a => a.day === dayOfWeek);
      if (availability) {
        const startTime = new Date(`2000-01-01T${availability.startTime}`);
        const endTime = new Date(`2000-01-01T${availability.endTime}`);
        
        // Generate 30-minute slots
        while (startTime < endTime) {
          const timeString = startTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          timeSlots.push(timeString);
          startTime.setMinutes(startTime.getMinutes() + 30);
        }
      }
    });

    // Remove duplicate time slots
    const uniqueTimeSlots = [...new Set(timeSlots)];

    res.json(uniqueTimeSlots);
  } catch (error) {
    console.error('Error fetching available times:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 