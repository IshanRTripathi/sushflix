// middlewares/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();
const logger = require('../config/logger');

const auth = (roles = []) => {
  return (req, res, next) => {
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
      req.user = decoded;

      // Check roles if provided
      if (roles.length > 0 && !roles.some(role => req.user.roles.includes(role))) {
        logger.warn(`Auth middleware: User does not have required roles. Required: ${roles.join(', ')}, User has: ${req.user.roles.join(', ')}`);
        return res.status(403).json({ message: 'Access denied' });
      }

      next();
    } catch (err) {
      logger.error('Auth middleware: Token verification failed', err);
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};

module.exports = auth;