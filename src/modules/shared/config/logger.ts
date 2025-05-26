import winston from 'winston';
import { TransformableInfo } from 'logform';

const { combine, timestamp, json, printf, colorize, simple } = winston.format;

// Define the log format type
interface LogFormat extends TransformableInfo {
  level: string;
  message: string;
  timestamp?: string;
  [key: string]: any;
}

interface LoggerOptions {
  /**
   * Minimum level of messages to log
   * @default 'info'
   */
  level?: string;
  
  /**
   * Whether to enable console logging
   * @default true
   */
  enableConsole?: boolean;
  
  /**
   * Whether to enable file logging
   * @default true
   */
  enableFileLogging?: boolean;
  
  /**
   * Path to the error log file
   * @default 'error.log'
   */
  errorLogPath?: string;
  
  /**
   * Path to the combined log file
   * @default 'combined.log'
   */
  combinedLogPath?: string;
}

/**
 * Create a configured logger instance
 * @param options Logger configuration options
 * @returns Configured winston logger instance
 */
const createLogger = (options: LoggerOptions = {}) => {
  const {
    level = 'info',
    enableConsole = true,
    enableFileLogging = true,
    errorLogPath = 'error.log',
    combinedLogPath = 'combined.log'
  } = options;

  const logger = winston.createLogger({
    level,
    format: combine(
      timestamp(),
      json()
    ),
    transports: []
  });

  if (enableFileLogging) {
    logger.add(new winston.transports.File({ 
      filename: errorLogPath, 
      level: 'error' 
    }));
    
    logger.add(new winston.transports.File({ 
      filename: combinedLogPath 
    }));
  }

  if (enableConsole) {
    logger.add(new winston.transports.Console({
      format: combine(
        colorize(),
        simple()
      )
    }));
  }

  return logger;
};

// Default logger instance with sensible defaults
const logger = createLogger();

export { createLogger };
export type { LoggerOptions };
export default logger;
