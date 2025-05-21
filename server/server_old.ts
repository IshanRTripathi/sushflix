import 'dotenv/config';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type Request, type Response, type NextFunction, type ErrorRequestHandler } from 'express';
// CORS will be dynamically imported
let cors: any;
import helmet from 'helmet';
import connectDB from '../src/modules/shared/config/db.js';
import { logger } from '../src/modules/shared/utils/logger.js';

// Get current directory path in a cross-platform way
const currentDir = process.cwd();
const uploadsDir = path.resolve(currentDir, process.env.UPLOAD_DIR || 'uploads');

// Import routes
import authRoutes from '../src/modules/auth/server/routes/auth.js';
import contentRoutes from '../src/modules/creator/server/routes/content.js';
import userRoutes from '../src/modules/user/routes/user.js';
import featuredProfilesRoutes from '../src/modules/profile/service/routes/featuredProfiles.js';

const loadRoutes = () => {
  try {
    logger.info('Loading routes...');
    const routes = { authRoutes, contentRoutes, userRoutes, featuredProfilesRoutes };
    logger.info('Routes loaded successfully');
    return routes;
  } catch (error) {
    logger.error('Failed to load routes:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'UnknownError'
    });
    process.exit(1);
  }
};

// Initialize the server
const initializeServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Load routes
    const { 
      authRoutes, 
      contentRoutes, 
      userRoutes, 
      featuredProfilesRoutes 
    } = loadRoutes();

    const app = express();
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
    

    // Security middleware
    app.use(helmet());
    
    // Dynamically import CORS
    try {
      const corsModule = await import('cors');
      // @ts-ignore - Handle both ESM and CJS exports
      cors = corsModule.default || corsModule;
      
      // Enable CORS
      const corsOptions = {
        origin: process.env['CLIENT_URL'] || 'http://localhost:3000',
        credentials: true
      };
      app.use(cors(corsOptions));
    } catch (error) {
      logger.error('Failed to initialize CORS:', error);
      // Continue without CORS in development
      if (process.env['NODE_ENV'] !== 'production') {
        logger.warn('Running without CORS in development mode');
      } else {
        throw error;
      }
    }

    // Request parsing
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // Mount routes
    app.use('/api/auth', authRoutes);
    app.use('/api/content', contentRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/featured-profiles', featuredProfilesRoutes);
    
    logger.info('Routes mounted successfully');

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
    app.use('/uploads', express.static(uploadsDir));

    // Health check endpoint
    app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({ 
        status: 'ok',
        timestamp: new Date().toISOString()
      });
    });

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
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : message
      });
    };

    app.use(errorHandler);

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      logger.error('Unhandled Rejection:', { 
        message: error.message, 
        stack: error.stack 
      });
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', { 
        message: error.message, 
        stack: error.stack 
      });
      server.close(() => process.exit(1));
    });

    return server;
  } catch (error) {
    logger.error('Failed to initialize server:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'UnknownError',
      code: (error as any).code,
      errors: (error as any).errors
    });
    process.exit(1);
  }
};

// Start the server
initializeServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
