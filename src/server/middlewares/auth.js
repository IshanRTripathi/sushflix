// middlewares/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();
const logger = require('../config/logger');

const User = require('../models/User');

const auth = (roles = []) => {
  return async (req, res, next) => {
    logger.info('Auth middleware executed');

    // Get token from Authorization header
    const authHeader = req.headers?.authorization;
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;

    if (!token) {
      logger.warn('Auth middleware: No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Add the username to the user object if it's not already present
      if (decoded.userId && !decoded.username) {
        try {
          const user = await User.findById(decoded.userId).select('username');
          if (user) {
            decoded.username = user.username;
          } else {
            logger.warn('User not found in database', { userId: decoded.userId });
            return res.status(401).json({ message: 'User not found' });
          }
        } catch (error) {
          logger.error('Error looking up user', {
            error: error.message,
            userId: decoded.userId,
            stack: error.stack
          });
          return res.status(500).json({ message: 'Error authenticating user' });
        }
      }
      req.user = decoded;

      // Check roles if provided
      if (roles.length > 0 && !decoded.role) {
        logger.warn('Auth middleware: No role in token');
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        logger.warn('Auth middleware: Insufficient permissions');
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (err) {
      logger.error('Auth middleware: Token verification failed', err);
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};

module.exports = auth;