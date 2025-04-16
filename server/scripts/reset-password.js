const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const resetPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find Dr. Sarah Johnson
    const user = await User.findOne({ email: 'sarah.johnson@example.com' });
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('doctor123', salt);

    // Update password
    user.password = hashedPassword;
    await user.save();
    console.log('Password reset successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetPassword(); 