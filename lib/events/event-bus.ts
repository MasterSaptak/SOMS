import { logger } from '@/lib/logger/logger'

export interface BaseEvent {
  id: string
  name: string
  timestamp: string
  payload: any
  metadata?: {
    userId?: string
    organizationId?: string
    [key: string]: any
  }
}

export type EventHandler<T extends BaseEvent> = (event: T) => Promise<void> | void

class EventBus {
  private handlers: Map<string, EventHandler<any>[]> = new Map()

  /**
   * Subscribe to a specific event
   */
  subscribe<T extends BaseEvent>(eventName: string, handler: EventHandler<T>) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, [])
    }
    this.handlers.get(eventName)!.push(handler)

    // Return an unsubscribe function
    return () => {
      const currentHandlers = this.handlers.get(eventName) || []
      this.handlers.set(
        eventName,
        currentHandlers.filter((h) => h !== handler)
      )
    }
  }

  /**
   * Publish an event asynchronously
   */
  async publish<T extends BaseEvent>(event: T) {
    logger.info(`[EventBus] Publishing event: ${event.name}`, { eventId: event.id })

    const eventHandlers = this.handlers.get(event.name) || []
    
    if (eventHandlers.length === 0) {
      logger.info(`[EventBus] No handlers registered for event: ${event.name}`)
      return
    }

    // Execute handlers concurrently to avoid blocking, but catch and log their errors
    Promise.allSettled(
      eventHandlers.map(async (handler) => {
        try {
          await handler(event)
        } catch (error) {
          logger.error(`[EventBus] Handler failed for event: ${event.name}`, error, { eventId: event.id })
        }
      })
    ).then((results) => {
      const failures = results.filter((r) => r.status === 'rejected')
      if (failures.length > 0) {
        logger.warn(`[EventBus] ${failures.length} handlers failed for event: ${event.name}`)
      }
    })
  }

  /**
   * Helper to construct a standard event payload
   */
  createEvent<T>(name: string, payload: T, metadata?: BaseEvent['metadata']): BaseEvent {
    return {
      id: crypto.randomUUID(),
      name,
      timestamp: new Date().toISOString(),
      payload,
      metadata
    }
  }
}

export const eventBus = new EventBus()
