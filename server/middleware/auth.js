const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  console.log('Auth middleware - Request headers:', req.headers);
  
  // Get token from header
  let token = req.header('x-auth-token');
  console.log('x-auth-token:', token);

  // If no token in x-auth-token header, try Authorization header
  if (!token) {
    const authHeader = req.header('Authorization');
    console.log('Authorization header:', authHeader);
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log('Extracted token from Authorization header:', token);
    }
  }

  // Check if no token
  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    console.log('Attempting to verify token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully. Decoded:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 