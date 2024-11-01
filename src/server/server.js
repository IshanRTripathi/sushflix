require('dotenv').config({ path: '../../.env' });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const subscriptionRoutes = require('./routes/subscriptions');
const uploadRoutes = require('./routes/upload');

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(morgan('dev'));

// Performance monitoring
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api', uploadRoutes);

// Error handling (Consolidated)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (err) {
        logger.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();