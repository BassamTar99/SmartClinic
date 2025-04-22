const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Array of doctor data
const doctors = [
  {
    userData: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@clinic.com',
      password: 'password123',
      role: 'doctor',
      phone: '555-123-4567',
      address: '123 Medical Center Ave, New York, NY 10001',
      dateOfBirth: '1980-05-15'
    },
    doctorData: {
      specialization: 'Cardiology',
      qualifications: ['MD', 'Board Certified in Cardiology', 'Fellow of the American College of Cardiology'],
      experience: 12,
      consultationFee: 150,
      availability: [
        {
          day: 'Monday',
          timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
        },
        {
          day: 'Wednesday',
          timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
        },
        {
          day: 'Friday',
          timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
        }
      ]
    }
  },
  {
    userData: {
      name: 'Michael Chen',
      email: 'michael.chen@clinic.com',
      password: 'password123',
      role: 'doctor',
      phone: '555-234-5678',
      address: '456 Health Blvd, New York, NY 10002',
      dateOfBirth: '1975-08-22'
    },
    doctorData: {
      specialization: 'Pediatrics',
      qualifications: ['MD', 'Board Certified in Pediatrics', 'American Academy of Pediatrics Member'],
      experience: 15,
      consultationFee: 125,
      availability: [
        {
          day: 'Tuesday',
          timeSlots: ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00']
        },
        {
          day: 'Thursday',
          timeSlots: ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00']
        },
        {
          day: 'Saturday',
          timeSlots: ['10:00', '11:00', '12:00']
        }
      ]
    }
  },
  {
    userData: {
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@clinic.com',
      password: 'password123',
      role: 'doctor',
      phone: '555-345-6789',
      address: '789 Healthcare Street, New York, NY 10003',
      dateOfBirth: '1983-11-10'
    },
    doctorData: {
      specialization: 'Neurology',
      qualifications: ['MD', 'PhD in Neuroscience', 'Board Certified in Neurology'],
      experience: 10,
      consultationFee: 175,
      availability: [
        {
          day: 'Monday',
          timeSlots: ['12:00', '13:00', '16:00', '17:00', '18:00']
        },
        {
          day: 'Wednesday',
          timeSlots: ['12:00', '13:00', '16:00', '17:00', '18:00']
        },
        {
          day: 'Friday',
          timeSlots: ['12:00', '13:00', '16:00', '17:00', '18:00']
        }
      ]
    }
  }
];

// Array of patient data
const patients = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    role: 'patient',
    phone: '555-987-6543',
    address: '123 Main St, New York, NY 10004',
    dateOfBirth: '1990-03-25'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    role: 'patient',
    phone: '555-876-5432',
    address: '456 Oak Ave, New York, NY 10005',
    dateOfBirth: '1985-07-14'
  },
  {
    name: 'Robert Brown',
    email: 'robert.brown@example.com',
    password: 'password123',
    role: 'patient',
    phone: '555-765-4321',
    address: '789 Pine St, New York, NY 10006',
    dateOfBirth: '1978-12-30'
  }
];

// Clear the database and insert new data
async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    
    console.log('Database cleared');
    
    // Create doctors with their profiles
    const createdDoctors = [];
    for (const doctor of doctors) {
      // Create doctor user
      const newUser = new User(doctor.userData);
      const savedUser = await newUser.save();
      console.log(`Created doctor user: ${savedUser.name}`);
      
      // Create doctor profile
      const doctorData = {
        ...doctor.doctorData,
        user: savedUser._id
      };
      const newDoctor = new Doctor(doctorData);
      const savedDoctor = await newDoctor.save();
      console.log(`Created doctor profile for: ${savedUser.name}`);
      
      createdDoctors.push({
        user: savedUser,
        profile: savedDoctor
      });
    }
    
    // Create patients
    const createdPatients = [];
    for (const patientData of patients) {
      const newPatient = new User(patientData);
      const savedPatient = await newPatient.save();
      console.log(`Created patient: ${savedPatient.name}`);
      createdPatients.push(savedPatient);
    }
    
    // Create some appointments
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const appointments = [
      {
        patient: createdPatients[0]._id,
        doctor: createdDoctors[0].profile._id,
        date: tomorrow,
        time: '10:00',
        symptoms: ['Chest pain', 'Shortness of breath'],
        notes: 'Patient has a family history of heart disease',
        status: 'scheduled'
      },
      {
        patient: createdPatients[1]._id,
        doctor: createdDoctors[1].profile._id,
        date: nextWeek,
        time: '09:00',
        symptoms: ['Fever', 'Cough'],
        notes: 'Annual checkup',
        status: 'scheduled'
      },
      {
        patient: createdPatients[2]._id,
        doctor: createdDoctors[2].profile._id,
        date: nextWeek,
        time: '13:00',
        symptoms: ['Headache', 'Dizziness'],
        notes: 'Follow-up appointment',
        status: 'scheduled'
      }
    ];
    
    for (const appointmentData of appointments) {
      const newAppointment = new Appointment(appointmentData);
      const savedAppointment = await newAppointment.save();
      console.log(`Created appointment for patient ID: ${savedAppointment.patient}`);
    }
    
    console.log('Database seeded successfully!');
    
    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@smartclinic.com',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Admin user created');
    
    // Exit the process
    mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();