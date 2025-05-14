require('dotenv').config({ path: '../../.env' });

const path = require('path');
// Server configuration
const PORT = process.env.PORT || 8080;
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
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const profilesRoutes = require('./routes/profiles');
const featuredProfilesRoutes = require('./routes/featuredProfiles');

// Initialize express
const app = express();

// Basic request logging
app.use((req, res, next) => {
  logger.info(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// Core Middlewares
app.use(cors());
app.use(express.json());
app.use(devLogin);
app.use(requestLogger);
app.use(morgan('dev'));

// Serve static files from the uploads directory
const uploadsDir = path.resolve(process.env.LOCAL_UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads'));
app.use('/uploads', express.static(uploadsDir));
logger.info(`Serving static files from: ${uploadsDir}`);

// Request duration/performance monitor
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      type: 'performance',
      method: req.method,
      path: req.originalUrl,
      duration: `${duration}ms`,
      status: res.statusCode
    });
  });
  next();
});

// Static files
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Health check
app.get('/health', (req, res) => {
  logger.info('Health check hit');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api', (req, res, next) => {
  logger.info(`API Hit: ${req.method} ${req.url}`);
  logger.debug('Headers:', req.headers);
  logger.debug('Body:', req.body);

  // Set timeout but don't handle response here
  req.setTimeout(51730, () => {
    logger.warn(`Request timeout: ${req.method} ${req.url}`);
  });

  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/featured', featuredProfilesRoutes);

// Error handling middleware
app.use(errorHandler);

// Serve frontend for non-API routes
app.get('*', (req, res, next) => {
  if (!req.url.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    next();
  }
});

// Centralized error handler
app.use(errorHandler);

// Global error handlers
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION', {
    message: err.message,
    stack: err.stack
  });
  process.exit(1); // Crash fast if critical
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('UNHANDLED PROMISE REJECTION', {
      message: reason?.message || reason,
      stack: reason?.stack || 'No stack trace',
      reason
    });
  });
  

// Server bootstrap

const startServer = async () => {
  logger.info('Initializing server...');
  try {
    await connectDB();
    logger.info('Database connected');
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Startup Error', err);
    process.exit(1);
  }
};

startServer();
