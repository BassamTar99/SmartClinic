const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

module.exports = function(req, res, next) {
  logger.info('Auth middleware - Request headers:', req.headers);
  
  // Get token from header
  let token = req.header('x-auth-token');
  logger.debug('x-auth-token:', token);

  // If no token in x-auth-token header, try Authorization header
  if (!token) {
    const authHeader = req.header('Authorization');
    logger.debug('Authorization header:', authHeader);
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      logger.debug('Extracted token from Authorization header:', token);
    }
  }

  // Check if no token
  if (!token) {
    logger.warn('No token found in request');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    logger.debug('Attempting to verify token...');
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.debug('Token verified successfully. Decoded:', decoded);
    
    // Set user info in request
    req.user = decoded;
    next();
  } catch (err) {
    logger.error('Token verification failed:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 