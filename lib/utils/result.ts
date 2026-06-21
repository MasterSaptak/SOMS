/**
 * Represents a successful operation.
 */
export type Success<T> = {
  success: true
  data: T
}

/**
 * Represents a failed operation.
 */
export type Failure<E = Error> = {
  success: false
  error: E
}

/**
 * A standard Result type for Domain Services and Repositories.
 */
export type Result<T, E = Error> = Success<T> | Failure<E>

/**
 * Creates a successful Result.
 */
export function success<T>(data: T): Success<T> {
  return { success: true, data }
}

/**
 * Creates a failed Result.
 */
export function failure<E = Error>(error: E): Failure<E> {
  return { success: false, error }
}
