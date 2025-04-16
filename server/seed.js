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
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@clinic.com",
    password: "doctor123",
    role: "doctor",
    specialization: "General Medicine",
    qualifications: ["MD", "Board Certified in Internal Medicine"],
    experience: 10,
    consultationFee: 100,
    availability: [
      {
        day: "Monday",
        startTime: "09:00",
        endTime: "17:00"
      },
      {
        day: "Tuesday",
        startTime: "09:00",
        endTime: "17:00"
      },
      {
        day: "Wednesday",
        startTime: "09:00",
        endTime: "17:00"
      },
      {
        day: "Thursday",
        startTime: "09:00",
        endTime: "17:00"
      },
      {
        day: "Friday",
        startTime: "09:00",
        endTime: "17:00"
      }
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
      {
        day: "Monday",
        startTime: "10:00",
        endTime: "18:00"
      },
      {
        day: "Wednesday",
        startTime: "10:00",
        endTime: "18:00"
      },
      {
        day: "Friday",
        startTime: "10:00",
        endTime: "18:00"
      }
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
  }
];

const appointments = [
  {
    date: new Date("2024-04-20"),
    time: "10:00",
    status: "scheduled",
    symptoms: "Regular checkup",
    notes: "Annual physical examination"
  },
  {
    date: new Date("2024-04-21"),
    time: "14:00",
    status: "scheduled",
    symptoms: "Chest pain",
    notes: "Possible cardiac consultation needed"
  }
];

const notifications = [
  {
    type: "reminder",
    message: "You have an appointment tomorrow at 10:00 AM",
    read: false
  },
  {
    type: "appointment",
    message: "Your appointment has been confirmed",
    read: true
  }
];

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
      const hashedPassword = await bcrypt.hash(doctor.password, 10);
      const user = await User.create({
        name: doctor.name,
        email: doctor.email,
        password: hashedPassword,
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
      const hashedPassword = await bcrypt.hash(patient.password, 10);
      return await User.create({
        name: patient.name,
        email: patient.email,
        password: hashedPassword,
        role: patient.role,
        medicalHistory: patient.medicalHistory,
        insurance: patient.insurance
      });
    }));
    console.log('Created patients');

    // Create appointments
    const createdAppointments = await Promise.all(appointments.map(async (appointment, index) => {
      return await Appointment.create({
        ...appointment,
        doctor: createdDoctors[index % createdDoctors.length].doctor._id,
        patient: createdPatients[index % createdPatients.length]._id
      });
    }));
    console.log('Created appointments');

    // Create notifications
    const createdNotifications = await Promise.all(notifications.map(async (notification, index) => {
      return await Notification.create({
        ...notification,
        user: createdPatients[index % createdPatients.length]._id
      });
    }));
    console.log('Created notifications');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 