import { env } from './env'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDevelopment = env.NODE_ENV === 'development'
  private isClient = typeof window !== 'undefined'

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] ${level.toUpperCase()}`
    
    if (context && Object.keys(context).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(context, null, 2)}`
    }
    
    return `${prefix} ${message}`
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment && level === 'debug') {
      return false
    }
    return true
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return
    
    if (this.isClient) {
      console.debug(this.formatMessage('debug', message, context))
    } else {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return
    
    if (this.isClient) {
      console.info(this.formatMessage('info', message, context))
    } else {
      console.info(this.formatMessage('info', message, context))
    }
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return
    
    if (this.isClient) {
      console.warn(this.formatMessage('warn', message, context))
    } else {
      console.warn(this.formatMessage('warn', message, context))
    }
  }

  error(message: string, context?: LogContext): void {
    if (!this.shouldLog('error')) return
    
    const formattedMessage = this.formatMessage('error', message, context)
    
    if (this.isClient) {
      console.error(formattedMessage)
    } else {
      console.error(formattedMessage)
    }

    // In production, you might want to send errors to a service like Sentry
    if (env.NODE_ENV === 'production' && this.isClient) {
      // TODO: Integrate with error reporting service
      // Sentry.captureException(new Error(message), { extra: context })
    }
  }

  // Performance timing
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label)
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label)
    }
  }
}

export const logger = new Logger()
