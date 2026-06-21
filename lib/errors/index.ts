/**
 * Base Application Error
 */
export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number

  constructor(message: string, code = 'INTERNAL_ERROR', statusCode = 500) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Validation Errors
 */
export class ValidationError extends AppError {
  public readonly details?: Record<string, string[]>

  constructor(message: string, details?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400)
    this.details = details
  }
}

/**
 * Authentication Errors
 */
export class AuthError extends AppError {
  constructor(message = 'Not authenticated') {
    super(message, 'UNAUTHORIZED', 401)
  }
}

/**
 * Permission Errors
 */
export class PermissionError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 'FORBIDDEN', 403)
  }
}

/**
 * Storage Errors
 */
export class StorageError extends AppError {
  constructor(message: string) {
    super(message, 'STORAGE_ERROR', 500)
  }
}

/**
 * Resource Not Found Errors
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND', 404)
  }
}
