'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CacheManager } from './cache-manager'
import { useQueryClient } from '@tanstack/react-query'

const SYNC_INTERVAL = 30 * 1000 // 30 seconds

export function useBackgroundSync() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const performSync = async () => {
      try {
        const lastSync = await CacheManager.getLastSync()
        const now = new Date().toISOString()
        
        // 1. Fetch Deltas (tasks updated after lastSync)
        // If no lastSync, we could either fetch all or just rely on regular queries for initial load.
        // For this demo, we'll just fetch all tasks if no lastSync, else deltas.
        let query = supabase.from('tasks').select('*')
        if (lastSync) {
          query = query.gte('updated_at', lastSync)
        }
        
        const { data: tasks, error } = await query
        
        if (tasks && tasks.length > 0) {
          // 2. Write to IndexedDB
          await CacheManager.saveTasks(tasks)
          
          // 3. Invalidate memory cache so UI re-renders if looking at tasks
          queryClient.invalidateQueries({ queryKey: ['tasks'] })
        }

        // Update sync timestamp
        await CacheManager.updateLastSync(now)

      } catch (error) {
        console.error('Background sync failed', error)
      } finally {
        timeoutId = setTimeout(performSync, SYNC_INTERVAL)
      }
    }

    // Start sync loop
    performSync()

    // Setup Realtime fallback
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
        },
        async (payload) => {
          // If a realtime event comes in, trigger a targeted cache update
          if (payload.table === 'tasks' && payload.new) {
            await CacheManager.saveTasks([payload.new as any])
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
          }
        }
      )
      .subscribe()

    return () => {
      clearTimeout(timeoutId)
      supabase.removeChannel(channel)
    }
  }, [queryClient, supabase])
}
