import { db } from './db'
import { isCacheEnabled, disableCacheTemporarily } from './flags'
import { createClient } from '@/lib/supabase/client'

class SyncEngineClass {
  private supabase = createClient()
  private isSyncing = false

  /**
   * Clears the entire IndexedDB cache. Typically called on logout.
   */
  async clearCache() {
    try {
      await db.delete()
      await db.open() // Re-open with empty tables
      console.log('SyncEngine: Cache successfully purged.')
    } catch (err) {
      console.error('SyncEngine: Failed to clear cache', err)
    }
  }

  /**
   * Run the initial data bootstrap.
   * This is called during the login flow before redirecting to the app.
   */
  async bootstrap(userId: string) {
    if (this.isSyncing) return
    this.isSyncing = true

    const t0 = performance.now()
    try {
      console.log('SyncEngine: Starting bootstrap sequence...')
      
      // Initialize metadata with bootstrapCompleted = false
      await db.metadata.put({
        key: 'lastSync',
        version: '1.0.0',
        schema: 2,
        lastSync: new Date().toISOString(),
        bootstrapCompleted: false,
        userId
      })

      // Wrap the foreground sync in a 10s timeout
      const foregroundSync = this.runForegroundSync(userId)
      const timeout = new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error('Bootstrap Timeout')), 10000)
      )

      await Promise.race([foregroundSync, timeout])

      // Mark foreground bootstrap completed
      await db.metadata.update('lastSync', { bootstrapCompleted: true })
      
      const t1 = performance.now()
      console.log(`SyncEngine: Foreground bootstrap completed in ${(t1 - t0).toFixed(2)}ms.`)

      // Kick off background syncs silently
      this.runBackgroundSync(userId)

    } catch (error: any) {
      const tEnd = performance.now()
      console.error(`SyncEngine: Bootstrap failed after ${(tEnd - t0).toFixed(2)}ms:`, error)
      
      // If it's a Dexie/Storage error, disable cache
      if (error?.name === 'QuotaExceededError' || error?.name === 'VersionError' || error?.inner?.name === 'DatabaseClosedError') {
        disableCacheTemporarily()
      }
      
      // If it was a timeout, we still mark it completed so they can proceed.
      if (error.message === 'Bootstrap Timeout') {
         console.warn('SyncEngine: Foreground sync timed out. Proceeding to dashboard, sync will continue in background.')
         await db.metadata.update('lastSync', { bootstrapCompleted: true })
         this.runBackgroundSync(userId)
      }

    } finally {
      this.isSyncing = false
    }
  }

  private async runForegroundSync(userId: string) {
    // 1. Profile Cache (Highest Priority)
    if (isCacheEnabled('CACHE_PROFILE')) {
      const t0 = performance.now()
      await this.syncProfile(userId)
      console.log(`SyncEngine: Profile sync took ${(performance.now() - t0).toFixed(2)}ms`)
    }

    // 2. Organization Cache
    if (isCacheEnabled('CACHE_ORGANIZATION')) {
       // const t0 = performance.now()
       // await this.syncOrganization()
       // console.log(`SyncEngine: Organization sync took ${(performance.now() - t0).toFixed(2)}ms`)
    }
  }

  private async runBackgroundSync(userId: string) {
    console.log('SyncEngine: Starting background sync...')
    try {
       // Employees, Projects, etc.
       if (isCacheEnabled('CACHE_EMPLOYEES')) {
          // await this.syncEmployees()
       }
    } catch (err) {
       console.error('SyncEngine: Background sync error', err)
    }
  }

  private async syncProfile(userId: string) {
    const { data: profile, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error

    if (profile) {
      await db.profiles.put({
        ...profile,
        updated_at: profile.updated_at || new Date().toISOString(),
      })
    }
  }
}

export const SyncEngine = new SyncEngineClass()
