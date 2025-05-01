const logger = require('../config/logger');
const mongoose = require('mongoose');

const errorHandler = (err, req, res, next) => {
    logger.info({message: 'Executing errorHandler middleware'});
    // Handle specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File size too large' });
    }
    if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({ message: err.message });
    }
    
    // Handle Mongoose validation errors
    if (err instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(err.errors).map(e => e.message);
        logger.warn({
            message: 'Mongoose validation error',
            errors: errors,
            path: req.path,
            method: req.method
        });
        return res.status(400).json({ message: 'Validation error', errors });
    }
    
    //Handle Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]
        return res.status(400).json({message: `${field} already exists`})
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
            : err.message,
        
    });
  
};

module.exports = errorHandler;