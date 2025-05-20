import 'dotenv/config';
import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from '../shared/config/db';
import logger from '../shared/config/logger';

// Routes
import authRoutes from '../auth/server/routes/auth';
import contentRoutes from '../creator/server/routes/content';
import subscriptionRoutes from '../subscription/routes/subscriptions';
import userRoutes from '../user/routes/user';
import postRoutes from './routes/post';
import profilesRoutes from '../profile/service/featuredProfileService';
import featuredProfilesRoutes from './routes/featuredProfiles';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

// Basic request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// Core middlewares
app.use(cors());
app.use(express.json());
app.use(devLogin);
app.use(requestLogger);
app.use(morgan('dev'));

// Serve static files from uploads directory
const uploadsDir = path.resolve(
  process.env.LOCAL_UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')
);
app.use('/uploads', express.static(uploadsDir));
logger.info(`Serving static files from: ${uploadsDir}`);

// Request duration/performance monitor
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      type: 'performance',
      method: req.method,
      path: req.originalUrl,
      duration: `${duration}ms`,
      status: res.statusCode,
    });
  });
  next();
});

// Serve frontend static files
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Health check
app.get('/health', (req: Request, res: Response) => {
  logger.info('Health check hit');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API logging and timeout middleware
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  logger.info(`API Hit: ${req.method} ${req.url}`);
  logger.debug('Headers:', req.headers);
  logger.debug('Body:', req.body);

  req.setTimeout(51730, () => {
    logger.warn(`Request timeout: ${req.method} ${req.url}`);
  });

  next();
});

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/featured', featuredProfilesRoutes);

// Error handling middleware
app.use(errorHandler);

// Serve frontend app for non-API routes
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (!req.url.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    next();
  }
});

// Centralized error handler (again, to catch anything missed)
app.use(errorHandler);

// Global error handlers
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION', {
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('UNHANDLED PROMISE REJECTION', {
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : 'No stack trace',
    reason,
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
  } catch (err: any) {
    logger.error('Startup Error', {
      message: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
};

startServer();
