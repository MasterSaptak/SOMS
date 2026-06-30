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
          await CacheManager.saveTasks(tasks as any[])
          
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

    // Setup Realtime — invalidate caches for all major entity types
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
        },
        async (payload) => {
          const table = payload.table
          // Map table names to React Query keys
          const tableKeyMap: Record<string, string[][]> = {
            tasks: [['tasks']],
            task_assignments: [['tasks']],
            projects: [['projects']],
            project_members: [['projects']],
            assets: [['assets']],
            consumables: [['consumables']],
            employees: [['employees'], ['employee360']],
            employee_education: [['employee360']],
            employee_experience: [['employee360']],
            employee_certifications: [['employee360']],
            employee_documents: [['employee360']],
            employee_skills: [['employee360']],
            departments: [['departments']],
            leaves: [['leaves']],
            attendance: [['attendance']],
            organizations: [['organizations']],
          }
          
          const keys = tableKeyMap[table]
          if (keys) {
            // Also save to IndexedDB for task-specific caching
            if (table === 'tasks' && payload.new) {
              await CacheManager.saveTasks([payload.new as any])
            }
            keys.forEach(key => queryClient.invalidateQueries({ queryKey: key }))
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
