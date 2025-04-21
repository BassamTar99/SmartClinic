const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
require('dotenv').config();

// Function to create doctor profiles for all users with the 'doctor' role
async function createDoctorProfiles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-clinic');
    console.log('Connected to MongoDB');

    // Find all users with the 'doctor' role who don't have a doctor profile
    const doctorUsers = await User.find({ role: 'doctor' });
    console.log(`Found ${doctorUsers.length} users with doctor role`);

    let createdCount = 0;
    let existingCount = 0;

    for (const user of doctorUsers) {
      // Check if a doctor profile already exists for this user
      const existingDoctor = await Doctor.findOne({ user: user._id });
      
      if (!existingDoctor) {
        // Create a default doctor profile
        const newDoctor = new Doctor({
          user: user._id,
          specialization: 'General Medicine',
          qualifications: ['MD'],
          experience: 0,
          consultationFee: 100,
          availability: [
            {
              day: 'Monday',
              startTime: '09:00',
              endTime: '17:00'
            },
            {
              day: 'Tuesday',
              startTime: '09:00',
              endTime: '17:00'
            },
            {
              day: 'Wednesday',
              startTime: '09:00',
              endTime: '17:00'
            },
            {
              day: 'Thursday',
              startTime: '09:00',
              endTime: '17:00'
            },
            {
              day: 'Friday',
              startTime: '09:00',
              endTime: '17:00'
            }
          ]
        });

        await newDoctor.save();
        console.log(`Created doctor profile for user: ${user.name} (${user.email})`);
        createdCount++;
      } else {
        console.log(`Doctor profile already exists for user: ${user.name} (${user.email})`);
        existingCount++;
      }
    }

    console.log('Migration completed:');
    console.log(`- Created ${createdCount} new doctor profiles`);
    console.log(`- Found ${existingCount} existing doctor profiles`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
createDoctorProfiles(); 