import { env } from './env';

/**
 * Log levels for the Logger class.
 * Logs with a level greater than or equal to the current log level will be output.
 */
export enum LogLevel {
  /** Debug level - most verbose, for development only */
  DEBUG = 'DEBUG',
  /** Info level - general operational information */
  INFO = 'INFO',
  /** Warning level - indicates a potential issue */
  WARN = 'WARN',
  /** Error level - indicates a failure in the application */
  ERROR = 'ERROR',
}

/**
 * Interface for log entry objects
 */
interface LogEntry {
  /** The log level */
  level: LogLevel;
  /** The log message */
  message: string;
  /** Timestamp of when the log was created */
  timestamp: Date;
  /** Optional context object with additional data */
  context?: Record<string, unknown>;
}

/**
 * Interface for logger configuration options
 */
interface LoggerOptions {
  /** The minimum log level to output */
  logLevel?: LogLevel;
  /** Whether to include timestamps in logs (default: true) */
  includeTimestamps?: boolean;
  /** Whether to include context in logs (default: true) */
  includeContext?: boolean;
}

/**
 * A singleton logger class that provides consistent logging throughout the application.
 * Supports different log levels and optional context objects.
 * 
 * @example
 * // Basic usage
 * logger.info('User logged in', { userId: 123 });
 * 
 * // Changing log level
 * logger.setLogLevel(LogLevel.WARN);
 */
class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private includeTimestamps: boolean;
  private includeContext: boolean;

  private constructor(options: LoggerOptions = {}) {
    const isProduction = env?.NODE_ENV === 'production';
    this.logLevel = options.logLevel || 
      (isProduction ? LogLevel.INFO : LogLevel.DEBUG);
    this.includeTimestamps = options.includeTimestamps ?? true;
    this.includeContext = options.includeContext ?? true;
  }

  /**
   * Gets the singleton instance of the Logger
   * @param {LoggerOptions} [options] - Optional configuration options
   * @returns {Logger} The logger instance
   */
  public static getInstance(options?: LoggerOptions): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(options);
    } else if (options) {
      // Apply options to existing instance
      if (options.logLevel !== undefined) {
        Logger.instance.setLogLevel(options.logLevel);
      }
      if (options.includeTimestamps !== undefined) {
        Logger.instance.setIncludeTimestamps(options.includeTimestamps);
      }
      if (options.includeContext !== undefined) {
        Logger.instance.setIncludeContext(options.includeContext);
      }
    }
    return Logger.instance;
  }

  /**
   * Formats a log entry into a string
   * @private
   */
  private formatMessage(entry: LogEntry): string {
    const parts = [];
    
    if (this.includeTimestamps) {
      parts.push(`[${entry.timestamp.toISOString()}]`);
    }
    
    parts.push(`[${entry.level}]`, entry.message);
    
    if (this.includeContext && entry.context) {
      try {
        parts.push(JSON.stringify(entry.context, null, 2));
      } catch (error) {
        // If JSON.stringify fails (e.g., due to circular references)
        parts.push('[Could not stringify context]');
      }
    }
    
    return parts.join(' ');
  }

  /**
   * Checks if a log level should be output based on current log level
   * @private
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  /**
   * Internal method to handle log writing
   * @private
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      ...(this.includeContext && context ? { context } : {}),
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
    }
  }

  public debug(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Sets the minimum log level
   * @param {LogLevel} level - The minimum log level to output
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Sets whether to include timestamps in log messages
   * @param {boolean} include - Whether to include timestamps
   */
  public setIncludeTimestamps(include: boolean): void {
    this.includeTimestamps = include;
  }

  /**
   * Sets whether to include context in log messages
   * @param {boolean} include - Whether to include context
   */
  public setIncludeContext(include: boolean): void {
    this.includeContext = include;
  }

  /**
   * Gets the current log level
   * @returns {LogLevel} The current log level
   */
  public getLogLevel(): LogLevel {
    return this.logLevel;
  }
}

export const logger = Logger.getInstance(); 