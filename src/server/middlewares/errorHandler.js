const logger = require('../config/logger');
const mongoose = require('mongoose');

const errorHandler = (err, req, res, next) => {
    // Log the error with full details
    logger.error('Error in request', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        status: err.status || 500,
        headers: req.headers,
        body: req.body
    });

    // Check if headers have already been sent
    if (res.headersSent) {
        logger.warn('Headers already sent, skipping error response', {
            path: req.path,
            method: req.method,
            status: err.status || 500
        });
        return;
    }

    // Handle specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            error: 'File size too large. Maximum allowed size is 5MB'
        });
    }

    if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({
            success: false,
            error: 'Invalid file type. Only image files are allowed'
        });
    }

    // Handle Mongoose validation errors
    if (err instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(err.errors).map(e => e.message);
        logger.warn('Mongoose validation error', {
            errors: errors,
            path: req.path,
            method: req.method,
            status: 400
        });
        return res.status(400).json({
            success: false,
            error: errors.join(', ')
        });
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