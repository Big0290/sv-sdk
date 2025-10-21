/**
 * Log levels in order of severity
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Log level priority for filtering
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
}

/**
 * Logger context for correlation and tracing
 */
export interface LogContext {
  correlationId?: string
  userId?: string
  requestId?: string
  [key: string]: unknown
}

/**
 * Log entry structure
 */
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
  [key: string]: unknown
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level: LogLevel
  pretty: boolean // Pretty print for development
  redactKeys: string[] | undefined // Keys to redact from logs (e.g., 'password', 'token')
}

/**
 * Default redacted keys for security
 */
const DEFAULT_REDACT_KEYS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'accessToken',
  'refreshToken',
  'authToken',
  'creditCard',
  'ssn',
]

/**
 * Structured logger with correlation IDs and PII redaction
 */
export class Logger {
  private config: LoggerConfig
  private redactKeys: Set<string>

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: (config.level || process.env.LOG_LEVEL || LogLevel.INFO) as LogLevel,
      pretty: config.pretty ?? process.env.NODE_ENV === 'development',
      redactKeys: config.redactKeys,
    }

    this.redactKeys = new Set([...DEFAULT_REDACT_KEYS, ...(config.redactKeys || [])])
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const currentPriority = LOG_LEVEL_PRIORITY[this.config.level]
    const messagePriority = LOG_LEVEL_PRIORITY[level]
    return messagePriority >= currentPriority
  }

  /**
   * Redact sensitive data from object
   */
  private redact(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
      return obj
    }

    if (typeof obj !== 'object') {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.redact(item))
    }

    const redacted: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(obj)) {
      if (this.redactKeys.has(key.toLowerCase())) {
        redacted[key] = '[REDACTED]'
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = this.redact(value)
      } else {
        redacted[key] = value
      }
    }

    return redacted
  }

  /**
   * Format log entry
   */
  private format(entry: LogEntry): string {
    const redactedEntry = this.redact(entry) as LogEntry

    if (this.config.pretty) {
      // Pretty print for development
      const emoji = {
        [LogLevel.DEBUG]: '🔍',
        [LogLevel.INFO]: 'ℹ️',
        [LogLevel.WARN]: '⚠️',
        [LogLevel.ERROR]: '❌',
      }

      let output = `${emoji[entry.level]} [${entry.level.toUpperCase()}] ${entry.message}`

      if (entry.context && Object.keys(entry.context).length > 0) {
        output += `\n  Context: ${JSON.stringify(redactedEntry.context, null, 2)}`
      }

      if (entry.error) {
        output += `\n  Error: ${redactedEntry.error?.name}: ${redactedEntry.error?.message}`
        if (redactedEntry.error?.stack) {
          output += `\n${redactedEntry.error.stack}`
        }
      }

      return output
    }

    // JSON format for production
    return JSON.stringify(redactedEntry)
  }

  /**
   * Log a message
   */
  private log(level: LogLevel, message: string, meta: Record<string, unknown> = {}): void {
    if (!this.shouldLog(level)) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }

    const formatted = this.format(entry)

    // Output to appropriate stream
    if (level === LogLevel.ERROR) {
      console.error(formatted)
    } else if (level === LogLevel.WARN) {
      console.warn(formatted)
    } else {
      console.log(formatted)
    }
  }

  /**
   * Debug level logging
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, { context })
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, { context })
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, { context })
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, {
      context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    })
  }

  /**
   * Create child logger with additional context
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger(this.config)
    const originalLog = childLogger.log.bind(childLogger)

    childLogger.log = (level: LogLevel, message: string, meta: Record<string, unknown> = {}) => {
      const mergedContext = {
        ...context,
        ...(meta.context as LogContext),
      }
      originalLog(level, message, { ...meta, context: mergedContext })
    }

    return childLogger
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger()

/**
 * Create logger with custom configuration
 */
export function createLogger(config: Partial<LoggerConfig> = {}): Logger {
  return new Logger(config)
}
