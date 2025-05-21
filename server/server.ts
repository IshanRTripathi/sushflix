import 'dotenv/config';
import express, { Request, Response, NextFunction, Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { createServer, Server } from 'http';
import connectDB from '../src/modules/shared/config/db';
import { logger } from '../src/modules/shared/utils/logger';

// Route imports
import authRoutes from '../src/modules/auth/server/routes/auth';
import contentRoutes from '../src/modules/creator/server/routes/content';
import userRoutes from '../src/modules/user/routes/user';
import featuredProfilesRoutes from '../src/modules/profile/service/routes/featuredProfiles';

// Constants
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

/**
 * Main application server class
 */
class AppServer {
  private app: Application;
  private server: Server;
  private isProduction: boolean;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.isProduction = process.env.NODE_ENV === 'production';
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize database connection
   */
  private async initializeDatabase(): Promise<void> {
    try {
      await connectDB();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection error:', error);
      throw error;
    }
  }

  /**
   * Configure application middlewares
   */
  private initializeMiddlewares(): void {
    // Security headers
    this.app.use(helmet());

    // CORS configuration
    this.app.use(cors({
      origin: CLIENT_URL,
      credentials: true,
    }));

    // Request parsing
    this.app.use(express.json({ limit: '10kb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // Request logging
    this.app.use(this.requestLogger);

    // Static files
    const uploadsPath = path.join(process.cwd(), UPLOAD_DIR);
    this.app.use('/uploads', express.static(uploadsPath));
  }

  /**
   * Request logger middleware
   */
  private requestLogger(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`);
    });
    next();
  }

  /**
   * Configure application routes
   */
  private initializeRoutes(): void {
    // API Routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/content', contentRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/featured-profiles', featuredProfilesRoutes);
    
    // Health check endpoint
    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      });
    });

    // 404 handler
    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({
        status: 'error',
        message: 'Not Found',
      });
    });
  }

  /**
   * Configure error handling
   */
  private initializeErrorHandling(): void {
    // Error handling middleware
    this.app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      const statusCode = err.statusCode || 500;
      const message = this.isProduction && statusCode === 500 ? 'Internal Server Error' : err.message;

      logger.error('Request error:', {
        message: err.message,
        status: statusCode,
        path: req.path,
        method: req.method,
        ...(!this.isProduction && { stack: err.stack }),
      });

      res.status(statusCode).json({
        status: 'error',
        message,
        ...(!this.isProduction && { stack: err.stack }),
      });
    });
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      await this.initializeDatabase();
      
      this.server.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });

      this.setupProcessHandlers();
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Setup process event handlers
   */
  private setupProcessHandlers(): void {
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      logger.error('Unhandled Rejection:', { 
        message: error.message, 
        stack: error.stack 
      });
      
      // Graceful shutdown
      this.gracefulShutdown(1);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', { 
        message: error.message, 
        stack: error.stack 
      });
      
      // Graceful shutdown
      this.gracefulShutdown(1);
    });

    // Handle termination signals
    ['SIGTERM', 'SIGINT'].forEach(signal => {
      process.on(signal, () => {
        logger.info(`${signal} received. Shutting down gracefully...`);
        this.gracefulShutdown(0);
      });
    });
  }

  /**
   * Gracefully shutdown the server
   */
  private gracefulShutdown(exitCode: number): void {
    this.server.close(() => {
      logger.info('Server closed');
      process.exit(exitCode);
    });

    // Force shutdown after timeout
    setTimeout(() => {
      logger.error('Forcing shutdown...');
      process.exit(1);
    }, 10000);
  }
}

// Create and start the server
const server = new AppServer();
server.start().catch(error => {
  logger.error('Fatal error during server startup:', error);
  process.exit(1);
});

export default server;
