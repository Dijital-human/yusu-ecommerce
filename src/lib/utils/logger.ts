/**
 * Logger Utility / Logger Köməkçisi
 * Centralized logging for the application
 * Tətbiq üçün mərkəzləşdirilmiş loglama
 */

type LogLevel = 'log' | 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  log(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('log', message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      ...(error instanceof Error && {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
      }),
    };
    
    if (this.isDevelopment || this.isProduction) {
      console.error(this.formatMessage('error', message, errorContext));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment || this.isProduction) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }
}

export const logger = new Logger();

