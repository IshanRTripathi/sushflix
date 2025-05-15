const logger = require('../config/logger');

/**
 * Middleware to check if the authenticated user is the owner of the resource
 * @param {string} idParam - The name of the parameter that contains the resource ID (default: 'id')
 * @returns {Function} Express middleware function
 */
const isOwner = (idParam = 'id') => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        logger.warn('Unauthorized access attempt - no user', {
          path: req.path,
          method: req.method,
          ip: req.ip
        });
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Get the resource ID from the request
      const resourceId = req.params[idParam];
      
      // Check if the authenticated user is the owner of the resource
      const userIdentifier = req.user.username || req.user.userId;
      if (!userIdentifier) {
        logger.warn('Forbidden: Invalid user identifier', {
          user: req.user,
          resourceId,
          path: req.path,
          method: req.method,
          ip: req.ip
        });
        return res.status(403).json({
          success: false,
          error: 'Invalid user authentication'
        });
      }

      // If the resource ID matches either username or user ID
      if (userIdentifier !== resourceId && req.user.userId !== resourceId) {
        logger.warn('Forbidden: User does not own this resource', {
          authenticatedUser: userIdentifier,
          resourceId,
          path: req.path,
          method: req.method,
          ip: req.ip
        });
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to access this resource'
        });
      }

      // User is authorized, proceed to the next middleware
      next();
    } catch (error) {
      logger.error('Authorization error', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method
      });
      return res.status(500).json({
        success: false,
        error: 'An error occurred during authorization'
      });
    }
  };
};

module.exports = {
  isOwner
};
