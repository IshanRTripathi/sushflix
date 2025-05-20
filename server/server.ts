import 'dotenv/config';
import * as path from 'path';
import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import * as cors from 'cors';
import * as helmet from 'helmet';
import connectDB from '../src/modules/shared/config/db';
import {logger} from '../src/modules/shared/utils/logger';

// Routes - Update these paths to point to the correct locations
const authRoutes = require('../src/modules/auth/server/routes/auth');
const contentRoutes = require('../src/modules/creator/server/routes/content');
const subscriptionRoutes = require('../src/modules/subscription/routes/subscriptions');
const userRoutes = require('../src/modules/user/routes/user');
const postRoutes = require('../src/modules/server/routes/post');
const featuredProfilesRoutes = require('../src/modules/server/routes/featuredProfiles');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

// Security middleware
app.use(helmet);
app.use(cors({
  origin: process.env['CLIENT_URL'] || 'http://localhost:3000',
  credentials: true
}));

// Request parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`);
  });
  next();
});

// Static files
const uploadsDir = path.resolve(process.env['UPLOAD_DIR'] || 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/featured', featuredProfilesRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found'
  });
});

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  logger.error('Error:', {
    message,
    status: statusCode,
    path: req.path,
    method: req.method
  });

  res.status(statusCode).json({
    status: 'error',
    message
  });
};
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    logger.info('Database connected');

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error: any) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', {error});
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason?.message || reason);
  process.exit(1);
});

// Start the server
startServer();
