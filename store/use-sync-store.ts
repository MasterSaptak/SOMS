import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SyncActionType = 'CREATE_TASK' | 'UPDATE_STATUS' | 'SUBMIT_LEAVE' | 'MARK_ATTENDANCE' | 'GENERIC_POST' | 'GENERIC_ACTION'

export interface SyncAction {
  id: string
  type: SyncActionType
  payload: any
  endpoint: string
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  timestamp: number
  status: 'pending' | 'syncing' | 'failed'
  error?: string
  description?: string
}

interface SyncState {
  queue: SyncAction[]
  isSyncing: boolean
  addAction: (action: Omit<SyncAction, 'id' | 'timestamp' | 'status'>) => void
  removeAction: (id: string) => void
  clearQueue: () => void
  syncAll: () => Promise<void>
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      queue: [],
      isSyncing: false,
      
      addAction: (action) => set((state) => ({
        queue: [...state.queue, {
          ...action,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          status: 'pending'
        }]
      })),

      removeAction: (id) => set((state) => ({
        queue: state.queue.filter(a => a.id !== id)
      })),

      clearQueue: () => set({ queue: [] }),

      syncAll: async () => {
        const { queue } = get()
        if (queue.length === 0 || !navigator.onLine) return

        set({ isSyncing: true })

        const pendingActions = queue.filter(a => a.status === 'pending' || a.status === 'failed')
        
        for (const action of pendingActions) {
          set((state) => ({
            queue: state.queue.map(a => a.id === action.id ? { ...a, status: 'syncing' } : a)
          }))

          try {
            // Mocking an API call
            await new Promise(resolve => setTimeout(resolve, 800))
            
            // On success, remove from queue
            set((state) => ({
              queue: state.queue.filter(a => a.id !== action.id)
            }))
          } catch (error: any) {
            set((state) => ({
              queue: state.queue.map(a => a.id === action.id ? { ...a, status: 'failed', error: error.message || 'Sync failed' } : a)
            }))
          }
        }

        set({ isSyncing: false })
      }
    }),
    {
      name: 'soms-offline-sync-queue',
    }
  )
)
