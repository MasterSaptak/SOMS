'use client'

import { useCallback, useRef, useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: Error | { message: string } }

export interface UseServerActionOptions<TData> {
  /** Toast shown on success. Set to `false` to suppress. */
  successMessage?: string | false
  /** Toast shown on error. Set to `false` to suppress. */
  errorMessage?: string | false
  /** React Query keys to invalidate after a successful mutation. */
  invalidateKeys?: string[][]
  /** Called after a successful mutation with the returned data. */
  onSuccess?: (data: TData) => void
  /** Called after a failed mutation with the error. */
  onError?: (error: Error) => void
  /** Called after the mutation settles (success or failure). */
  onSettled?: () => void
}

export interface UseServerActionReturn<TInput, TData> {
  /** Execute the server action. */
  execute: (...args: TInput extends void ? [] : [TInput]) => Promise<ActionResult<TData> | undefined>
  /** Whether the action is currently executing. */
  isLoading: boolean
  /** The error from the last execution, if any. */
  error: Error | null
  /** The data from the last successful execution, if any. */
  data: TData | null
  /** Reset state (data, error) to initial values. */
  reset: () => void
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Universal hook for calling Server Actions with:
 * - Loading state management
 * - Automatic React Query cache invalidation
 * - Standardized toast notifications (success & error)
 * - Error state tracking
 *
 * Replaces ad-hoc useState-based patterns across all modules.
 *
 * @example
 * ```tsx
 * const { execute, isLoading } = useServerAction(createTaskAction, {
 *   successMessage: 'Task created!',
 *   invalidateKeys: [['tasks']],
 *   onSuccess: () => setOpen(false)
 * })
 * ```
 */
export function useServerAction<TInput = void, TData = unknown>(
  action: (...args: any[]) => Promise<ActionResult<TData>>,
  options: UseServerActionOptions<TData> = {}
): UseServerActionReturn<TInput, TData> {
  const {
    successMessage = 'Operation completed successfully',
    errorMessage,
    invalidateKeys = [],
    onSuccess,
    onError,
    onSettled,
  } = options

  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<TData | null>(null)

  // Prevent double-submission
  const lockRef = useRef(false)

  const execute = useCallback(
    async (...args: any[]) => {
      if (lockRef.current) return
      lockRef.current = true
      setIsExecuting(true)
      setError(null)

      try {
        const result = await action(...args)

        if (result.success) {
          setData(result.data)

          // Invalidate React Query caches
          if (invalidateKeys.length > 0) {
            await Promise.all(
              invalidateKeys.map((key) =>
                queryClient.invalidateQueries({ queryKey: key })
              )
            )
          }

          // Show success toast
          if (successMessage !== false) {
            toast.success(successMessage)
          }

          onSuccess?.(result.data)
          return result
        } else {
          const err =
            result.error instanceof Error
              ? result.error
              : new Error(
                  (result.error as any)?.message || 'An unexpected error occurred'
                )
          setError(err)

          // Show error toast
          if (errorMessage !== false) {
            toast.error(errorMessage || err.message || 'Operation failed')
          }

          onError?.(err)
          return result
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unexpected error occurred')
        setError(error)

        if (errorMessage !== false) {
          toast.error(errorMessage || error.message || 'Operation failed')
        }

        onError?.(error)
        return { success: false as const, error }
      } finally {
        lockRef.current = false
        setIsExecuting(false)
        onSettled?.()
      }
    },
    [action, invalidateKeys, queryClient, successMessage, errorMessage, onSuccess, onError, onSettled]
  )

  const reset = useCallback(() => {
    setError(null)
    setData(null)
  }, [])

  return {
    execute: execute as any,
    isLoading: isExecuting,
    error,
    data,
    reset,
  }
}
