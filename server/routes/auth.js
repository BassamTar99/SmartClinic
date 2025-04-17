const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    logger.info(`Registration attempt for user: ${email}`);

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      logger.warn(`Registration failed - User already exists: ${email}`);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'patient'
    });

    await user.save();
    logger.info(`User registered successfully: ${email}`);

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info(`Login attempt for user: ${email}`);

    // Validate input
    if (!email || !password) {
      logger.warn('Login failed - Missing email or password');
      return res.status(400).json({ 
        message: 'Email and password are required',
        type: 'validation'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login failed - User not found: ${email}`);
      return res.status(400).json({ 
        message: 'Invalid email or password',
        type: 'auth'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Login failed - Invalid password for user: ${email}`);
      return res.status(400).json({ 
        message: 'Invalid email or password',
        type: 'auth'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`Login successful for user: ${email}`);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error',
      type: 'server'
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      logger.warn('Unauthorized access attempt - No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      logger.warn('Unauthorized access attempt - User not found');
      return res.status(401).json({ message: 'User not found' });
    }

    logger.info(`User info retrieved for: ${user.email}`);
    res.json(user);
  } catch (error) {
    logger.error('Auth check error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
  try {
    console.log('Admin password reset request received:', req.body);
    const { email, newPassword } = req.body;
    logger.info(`Admin password reset for user: ${email}`);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Password reset failed - User not found: ${email}`);
      return res.status(400).json({ 
        message: 'User not found',
        type: 'auth'
      });
    }

    // Update password - the pre-save hook will handle hashing
    user.password = newPassword;
    await user.save();
    logger.info(`Password reset successful for user: ${email}`);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    logger.error('Password reset error:', error);
    res.status(500).json({ 
      message: 'Server error',
      type: 'server'
    });
  }
});

module.exports = router; 