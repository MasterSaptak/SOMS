import { logAuditAction } from '@/lib/audit'

type LogLevel = 'info' | 'warn' | 'error' | 'audit'

interface LogContext {
  [key: string]: any
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...context
    }

    // In a real application, this could send logs to Datadog, ELK, Sentry, etc.
    // For now, we use a structured server console log.
    if (process.env.NODE_ENV !== 'test') {
      const output = JSON.stringify(logEntry)
      if (level === 'error') {
        console.error(output)
      } else if (level === 'warn') {
        console.warn(output)
      } else {
        console.info(output)
      }
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    this.log('error', message, {
      ...context,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error)
    })
  }

  /**
   * Dedicated audit log method that pushes directly to the database via lib/audit
   * @param action The action being performed
   * @param resource The resource being accessed/modified
   * @param context Detailed audit context
   */
  async audit(action: string, resource: string, context?: LogContext) {
    this.log('audit', `[AUDIT] ${action} on ${resource}`, context)
    
    // Asynchronously push to Supabase audit_logs
    await logAuditAction({
      action,
      resource,
      userId: context?.userId,
      details: context?.details,
      oldValues: context?.oldValues,
      newValues: context?.newValues
    })
  }
}

export const logger = new Logger()
