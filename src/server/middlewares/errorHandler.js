const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  // Handle specific errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File size too large' });
  }
  if (err.message === 'Only image files are allowed!') {
    return res.status(400).json({ message: err.message });
  }

  // Log the error details
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Send error response
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message
  });
};

module.exports = errorHandler;