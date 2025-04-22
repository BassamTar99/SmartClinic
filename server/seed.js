const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const Notification = require('./models/Notification');

// Sample data
const doctors = [
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@clinic.com",
    password: "doctor123",
    role: "doctor",
    specialization: "General Medicine",
    qualifications: ["MD", "Board Certified in Internal Medicine"],
    experience: 10,
    consultationFee: 100,
    availability: [
      { day: "Monday", startTime: "09:00", endTime: "17:00" },
      { day: "Tuesday", startTime: "09:00", endTime: "17:00" },
      { day: "Wednesday", startTime: "09:00", endTime: "17:00" },
      { day: "Thursday", startTime: "09:00", endTime: "17:00" },
      { day: "Friday", startTime: "09:00", endTime: "17:00" }
    ]
  },
  {
    name: "Dr. Michael Chen",
    email: "michael.chen@clinic.com",
    password: "doctor123",
    role: "doctor",
    specialization: "Cardiology",
    qualifications: ["MD", "Fellowship in Cardiology"],
    experience: 15,
    consultationFee: 150,
    availability: [
      { day: "Monday", startTime: "10:00", endTime: "18:00" },
      { day: "Wednesday", startTime: "10:00", endTime: "18:00" },
      { day: "Friday", startTime: "10:00", endTime: "18:00" }
    ]
  },
  {
    name: "Dr. Emily Rodriguez",
    email: "emily.rodriguez@clinic.com",
    password: "doctor123",
    role: "doctor",
    specialization: "Pediatrics",
    qualifications: ["MD", "Board Certified in Pediatrics"],
    experience: 8,
    consultationFee: 120,
    availability: [
      { day: "Tuesday", startTime: "09:00", endTime: "17:00" },
      { day: "Thursday", startTime: "09:00", endTime: "17:00" },
      { day: "Saturday", startTime: "10:00", endTime: "15:00" }
    ]
  }
];

const patients = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "patient123",
    role: "patient",
    medicalHistory: "No significant medical history",
    insurance: "Blue Cross"
  },
  {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    password: "patient123",
    role: "patient",
    medicalHistory: "Allergic to penicillin",
    insurance: "Aetna"
  },
  {
    name: "Robert Wilson",
    email: "robert.wilson@example.com",
    password: "patient123",
    role: "patient",
    medicalHistory: "Hypertension, Type 2 Diabetes",
    insurance: "Medicare"
  },
  {
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    password: "patient123",
    role: "patient",
    medicalHistory: "Asthma",
    insurance: "UnitedHealth"
  }
];

// Appointments will be created dynamically based on doctor-patient pairs
const createAppointmentData = (doctorId, patientId, index) => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + index * 2); // Spread appointments over coming days

  const appointments = [
    {
      doctor: doctorId,
      patient: patientId,
      date: futureDate,
      time: "10:00",
      status: "scheduled",
      symptoms: ["Fever", "Cough"],
      notes: "Regular checkup with follow-up"
    },
    {
      doctor: doctorId,
      patient: patientId,
      date: new Date(futureDate.setDate(futureDate.getDate() + 14)), // Follow-up in 2 weeks
      time: "14:00",
      status: "scheduled",
      symptoms: ["Follow-up"],
      notes: "Follow-up appointment"
    }
  ];
  return appointments[index % 2];
};

// Create notification data based on appointment and user
const createNotificationData = (appointment, userId, isDoctor) => {
  const notifications = [];
  
  // Appointment reminder
  notifications.push({
    user: userId,
    type: "reminder",
    message: isDoctor 
      ? `You have an appointment scheduled with a patient on ${appointment.date.toLocaleDateString()} at ${appointment.time}`
      : `You have an appointment scheduled with your doctor on ${appointment.date.toLocaleDateString()} at ${appointment.time}`,
    appointment: appointment._id,
    isRead: false
  });

  // Appointment confirmation
  notifications.push({
    user: userId,
    type: "appointment",
    message: isDoctor
      ? `New appointment scheduled with patient for ${appointment.date.toLocaleDateString()}`
      : `Your appointment has been confirmed for ${appointment.date.toLocaleDateString()}`,
    appointment: appointment._id,
    isRead: false
  });

  return notifications;
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-clinic', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data');

    // Create doctors
    const createdDoctors = await Promise.all(doctors.map(async (doctor) => {
      const user = await User.create({
        name: doctor.name,
        email: doctor.email,
        password: doctor.password, // Model's pre-save hook will hash this
        role: doctor.role
      });
      
      const doctorDoc = await Doctor.create({
        user: user._id,
        specialization: doctor.specialization,
        qualifications: doctor.qualifications,
        experience: doctor.experience,
        consultationFee: doctor.consultationFee,
        availability: doctor.availability
      });

      return { user, doctor: doctorDoc };
    }));
    console.log('Created doctors');

    // Create patients
    const createdPatients = await Promise.all(patients.map(async (patient) => {
      return await User.create({
        name: patient.name,
        email: patient.email,
        password: patient.password, // Model's pre-save hook will hash this
        role: patient.role
      });
    }));
    console.log('Created patients');

    // Create appointments with specific doctor-patient pairs
    let appointmentIndex = 0;
    const createdAppointments = [];
    
    for (const doctor of createdDoctors) {
      for (const patient of createdPatients) {
        const appointmentData = createAppointmentData(
          doctor.doctor._id,
          patient._id,
          appointmentIndex
        );
        
        const appointment = await Appointment.create(appointmentData);
        createdAppointments.push(appointment);

        // Create notifications for both doctor and patient
        const doctorNotifications = createNotificationData(appointment, doctor.user._id, true);
        const patientNotifications = createNotificationData(appointment, patient._id, false);

        await Promise.all([
          ...doctorNotifications.map(notification => Notification.create(notification)),
          ...patientNotifications.map(notification => Notification.create(notification))
        ]);

        appointmentIndex++;
      }
    }
    console.log('Created appointments and notifications');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();