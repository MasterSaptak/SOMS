"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Server, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { APP_VERSION as CURRENT_VERSION, BUILD_ID as CURRENT_BUILD_ID, BUILD_DATE as CURRENT_BUILD_DATE, ENVIRONMENT } from '@/lib/system/version'
import { revalidateAppCacheAction } from '@/app/actions/system.actions'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

interface VersionData {
  version: string
  buildId: string
  buildDate: string
  environment: string
}

export function SystemUpdateCenter() {
  const router = useRouter()
  const [latestData, setLatestData] = useState<VersionData | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkForUpdates = async () => {
    setIsChecking(true)
    setError(null)
    try {
      const res = await fetch('/api/version', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch version info')
      const data: VersionData = await res.json()
      setLatestData(data)
    } catch (err: any) {
      setError('Unable to check for updates.')
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkForUpdates()
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000) // Check every 5 mins
    return () => clearInterval(interval)
  }, [])

  const hasUpdate = latestData && (latestData.version !== CURRENT_VERSION || latestData.buildId !== CURRENT_BUILD_ID)

  const handleUpdate = async () => {
    if (!confirm('This will clear local cache and reload the application to fetch the latest deployed version. No server data will be lost. Proceed?')) {
      return
    }

    setIsUpdating(true)
    try {
      // 1. Clear LocalStorage (preserve Supabase auth)
      const lsKeysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && !key.toLowerCase().includes('supabase') && !key.toLowerCase().startsWith('sb-')) {
          lsKeysToRemove.push(key)
        }
      }
      lsKeysToRemove.forEach(k => localStorage.removeItem(k))

      // 2. Clear SessionStorage
      sessionStorage.clear()

      // 3. Clear Cache API (Service Worker caches, etc)
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }

      // 4. Update Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const reg of registrations) {
          await reg.update()
        }
      }

      // 5. Clear IndexedDB
      if ('indexedDB' in window && indexedDB.databases) {
        const dbs = await indexedDB.databases()
        for (const db of dbs) {
          if (db.name) indexedDB.deleteDatabase(db.name)
        }
      }

      // 6. Revalidate Next.js cache
      await revalidateAppCacheAction()

      // 7. Hard reload
      router.refresh()
      window.location.reload()
      
    } catch (err) {
      console.error('Update failed:', err)
      alert('An error occurred while updating the app.')
      setIsUpdating(false)
    }
  }

  return (
    <Card className="h-full flex flex-col relative overflow-hidden group border-border/50 bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-primary" />
          <CardTitle className="text-base font-semibold">System Update Center</CardTitle>
        </div>
        <Badge variant="outline" className="text-xs bg-background/50">{ENVIRONMENT}</Badge>
      </CardHeader>
      <CardContent className="flex-1 pt-4 flex flex-col justify-between">
        <div className="space-y-4">
          
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Current Version</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold">{CURRENT_VERSION}</span>
                <span className="text-xs text-muted-foreground font-mono">{CURRENT_BUILD_ID}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {new Date(CURRENT_BUILD_DATE).toLocaleString()}
              </p>
            </div>
            {hasUpdate && latestData && (
              <div className="text-right">
                <p className="text-xs text-amber-500 uppercase tracking-wider font-semibold mb-1">Latest Available</p>
                <div className="flex items-baseline gap-2 justify-end">
                  <span className="text-xl font-bold text-amber-500">{latestData.version}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{latestData.buildId}</p>
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg border border-border/50 bg-background/50">
            {isChecking ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" /> Checking for updates...
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            ) : hasUpdate ? (
              <div className="flex items-center gap-2 text-sm text-amber-500 font-medium">
                <AlertCircle className="w-4 h-4" /> New version available!
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-emerald-500 font-medium">
                <CheckCircle2 className="w-4 h-4" /> You are running the latest version.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={checkForUpdates} disabled={isChecking || isUpdating}>
            Check Again
          </Button>
          <Button 
            size="sm" 
            onClick={handleUpdate} 
            disabled={isUpdating}
            className={hasUpdate ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Updating...
              </>
            ) : (
              'Update Now'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
