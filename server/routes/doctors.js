const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const auth = require('../middleware/auth');

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

    // Validate each availability slot
    for (const slot of availability) {
      if (!slot.day || !slot.startTime || !slot.endTime) {
        return res.status(400).json({ 
          message: 'Each availability slot must have day, startTime, and endTime' 
        });
      }
      
      // Validate day of week
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      if (!validDays.includes(slot.day)) {
        return res.status(400).json({ message: 'Invalid day of week' });
      }

      // Validate time format (could add more validation here)
      if (!/^\d{2}:\d{2}$/.test(slot.startTime) || !/^\d{2}:\d{2}$/.test(slot.endTime)) {
        return res.status(400).json({ message: 'Time must be in format HH:MM' });
      }

      // Ensure startTime is before endTime
      if (slot.startTime >= slot.endTime) {
        return res.status(400).json({ 
          message: 'Start time must be earlier than end time' 
        });
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