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
    if (doctorId) {
      // Try to find a doctor with this _id
      let doctor = await Doctor.findById(doctorId);
      if (doctor) {
        query.doctor = doctorId;
      } else {
        // If not found, try to find by user id
        doctor = await Doctor.findOne({ user: doctorId });
        if (doctor) {
          query.doctor = doctor._id;
        } else {
          // No doctor found, return empty result
          return res.json([]);
        }
      }
    }
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

    const formattedAppointments = appointments.map(appt => ({
      ...appt._doc,
      doctor: {
        ...appt.doctor._doc,
        name: appt.doctor.user.name
      }
    }));

    res.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new appointment
router.post('/', auth, async (req, res) => {
  try {
    const { patient, doctor, date, time, symptoms, notes } = req.body;

    // Ensure time is in HH:mm format
    let formattedTime = time;
    if (time) {
      // Convert potential 12-hour format to 24-hour format
      const timeParts = time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (timeParts) {
        let [_, hours, minutes, period] = timeParts;
        hours = parseInt(hours);
        if (period && period.toUpperCase() === 'PM' && hours < 12) {
          hours += 12;
        } else if (period && period.toUpperCase() === 'AM' && hours === 12) {
          hours = 0;
        }
        formattedTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
      }
    }

    const appointment = new Appointment({
      patient,
      doctor,
      date,
      time: formattedTime,
      symptoms: typeof symptoms === 'string' ? [symptoms] : symptoms,
      notes
    });

    await appointment.save();

    // Fetch the saved appointment with populated fields
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    // Format the response
    const formattedAppointment = {
      ...populatedAppointment._doc,
      doctor: {
        ...populatedAppointment.doctor._doc,
        name: populatedAppointment.doctor.user.name
      }
    };

    res.status(201).json(formattedAppointment);
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
    const { doctorId, date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    // Get the day of week for the selected date
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find the doctor with the specified ID, or all doctors if no ID is provided
    const doctorQuery = doctorId ? { _id: doctorId } : {};
    const doctors = await Doctor.find(doctorQuery).populate('user', 'name email');
    
    // If no doctors found
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'No doctors found with the specified criteria' });
    }

    // Get existing appointments for the selected date to check availability
    const existingAppointments = await Appointment.find({
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59))
      },
      ...(doctorId && { doctor: doctorId }),
      status: { $ne: 'cancelled' }
    });

    // Map of time slots already booked: { doctorId: ['08:00', '09:00', etc.] }
    const bookedSlots = {};
    existingAppointments.forEach(appt => {
      const docId = appt.doctor.toString();
      if (!bookedSlots[docId]) {
        bookedSlots[docId] = [];
      }
      bookedSlots[docId].push(appt.time);
    });

    // Prepare result with doctor availability and booked slots
    const result = doctors.map(doctor => {
      // Find this doctor's availability for the selected day
      const dayAvailability = doctor.availability.find(a => a.day === dayOfWeek);
      
      if (!dayAvailability) {
        return {
          doctorId: doctor._id,
          doctorName: doctor.user.name,
          availableTimeSlots: [] // Doctor not available on this day
        };
      }
      
      // Get this doctor's booked slots
      const doctorBookedSlots = bookedSlots[doctor._id.toString()] || [];
      
      // Filter available time slots by removing booked ones
      const availableTimeSlots = (dayAvailability.timeSlots || [])
        .filter(slot => !doctorBookedSlots.includes(slot))
        .sort();

      return {
        doctorId: doctor._id,
        doctorName: doctor.user.name,
        availableTimeSlots
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching available times:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointments for a specific patient
router.get('/patient/:id', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.params.id })
      .populate('patient', 'name email')
      .populate({
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort({ date: 1 });

    const formattedAppointments = appointments.map(appt => ({
      ...appt._doc,
      doctor: {
        ...appt.doctor._doc,
        name: appt.doctor.user.name
      }
    }));

    res.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;