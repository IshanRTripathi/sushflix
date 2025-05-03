import { User } from '../components/auth/AuthContext';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  userId?: string;
  traceId?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context: LogContext;
}

class Logger {
  private static instance: Logger;
  private currentUser: User | null = null;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setUser(user: User | null): void {
    this.currentUser = user;
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  private createLogEntry(level: LogLevel, message: string, context: LogContext = {}): LogEntry {
    return {
      timestamp: new Date(),
      level,
      message,
      context: {
        ...context,
        userId: this.currentUser?.userId,
      },
    };
  }

  private log(level: LogLevel, message: string, context: LogContext = {}): void {
    const entry = this.createLogEntry(level, message, context);
    const formattedMessage = `[${entry.timestamp.toISOString()}] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'debug':
        console.debug(formattedMessage, entry.context);
        break;
      case 'info':
        console.info(formattedMessage, entry.context);
        break;
      case 'warn':
        console.warn(formattedMessage, entry.context);
        break;
      case 'error':
        console.error(formattedMessage, entry.context);
        break;
    }
  }

  public debug(message: string, context: LogContext = {}): void {
    this.log('debug', message, context);
  }

  public info(message: string, context: LogContext = {}): void {
    this.log('info', message, context);
  }

  public warn(message: string, context: LogContext = {}): void {
    this.log('warn', message, context);
  }

  public error(message: string, error: unknown, context: LogContext = {}): void {
    this.log('error', `${message}: ${this.formatError(error)}`, {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    });
  }
}

export const logger = Logger.getInstance(); 