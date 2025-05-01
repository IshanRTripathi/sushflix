require('dotenv').config({ path: '../../.env' });

const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');
const devLogin = require('./devLogin');

// Routes
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const subscriptionRoutes = require('./routes/subscriptions');
const uploadRoutes = require('./routes/upload');

// Initialize express
const app = express();

// Add a very early log to see if requests reach here
app.use((req, res, next) => {
    logger.info(`Request received: ${req.method} ${req.url}`);
    next();
});

// Middleware
logger.info('Applying CORS middleware');
app.use(cors());
logger.info('CORS middleware applied');

logger.info('Applying devLogin middleware');
app.use(devLogin);
logger.info('devLogin middleware applied');

logger.info('Applying express.json middleware');
app.use(express.json());
logger.info('express.json middleware applied');

logger.info('Applying requestLogger middleware');
app.use(requestLogger);
logger.info('requestLogger middleware applied');

logger.info('Applying morgan middleware');
app.use(morgan('dev'));
logger.info('morgan middleware applied');

// Performance monitoring
logger.info('Applying performance monitoring middleware');
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            path: req.path,
            duration: `${duration}ms`,
            status: res.statusCode
        });
    });
    next();
});
logger.info('Performance monitoring middleware applied');

// Serve static files from the 'dist' directory
const distPath = path.join(__dirname, '..', '..', 'dist');
logger.info(`Serving static files from: ${distPath}`);
app.use(express.static(distPath));
logger.info('Static files middleware applied');

// Routes
logger.info('Applying auth routes');
app.use('/api/auth', authRoutes);
logger.info('Auth routes applied');

logger.info('Applying content routes');
app.use('/api/content', contentRoutes);
logger.info('Content routes applied');

logger.info('Applying subscriptions routes');
app.use('/api/subscriptions', subscriptionRoutes);
logger.info('Subscriptions routes applied');

logger.info('Applying upload routes');
app.use('/api', uploadRoutes);
logger.info('Upload routes applied');

// Handle other routes by serving the 'index.html' file
logger.info('Applying catch-all route for index.html');
app.get('*', (req, res) => {
    logger.info(`Catch-all route serving index.html for path: ${req.path}`);
    res.sendFile(path.join(distPath, 'index.html'));
});
logger.info('Catch-all route applied');


// Error handling (Consolidated)
logger.info('Applying error handling middleware');
app.use(errorHandler);
logger.info('Error handling middleware applied');

const PORT = process.env.PORT || 8080;

// Add uncaught exception handler
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION:', err);
    // Consider graceful shutdown here if needed
    // process.exit(1); // Exit the process after logging
});

const startServer = async () => {
    logger.info('Starting server initialization...'); // Added log
    try {
        logger.info('Attempting to connect to database...'); // Added log
        await connectDB();
        logger.info('Database connected successfully');
        logger.info(`Attempting to start server listener on port ${PORT}...`); // Added log
        app.listen(PORT, 0.0.0.0, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (err) {
        logger.error('Failed to start server:', err);
        // process.exit(1); // Keep the process alive for further inspection unless critical
    }
};

startServer();